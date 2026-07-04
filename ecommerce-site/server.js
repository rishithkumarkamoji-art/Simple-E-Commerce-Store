const express = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { execFile } = require("child_process");
const { promisify } = require("util");

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "127.0.0.1";
const DATA_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DATA_DIR, "shop.sqlite");
const execFileAsync = promisify(execFile);
const scryptAsync = promisify(crypto.scrypt);

const sessions = new Map();
const REGIONS = {
  india: {
    freeShippingThresholdCents: cents(60),
    shippingCents: cents(1.79),
    taxRate: 0.18
  },
  international: {
    freeShippingThresholdCents: cents(100),
    shippingCents: cents(7.99),
    taxRate: 0.0825
  }
};
const SOCIAL_PROVIDERS = {
  google: {
    name: "Google Shopper",
    email: "google.shopper@marketlane.example.com"
  },
  apple: {
    name: "Apple ID Shopper",
    email: "apple.shopper@marketlane.example.com"
  },
  microsoft: {
    name: "Microsoft Shopper",
    email: "microsoft.shopper@marketlane.example.com"
  }
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function sql(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new Error("Invalid numeric value");
    return String(value);
  }
  if (typeof value === "boolean") return value ? "1" : "0";
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function db(sqlText, json = false) {
  const args = json ? ["-json", DB_PATH, sqlText] : [DB_PATH, sqlText];
  const { stdout } = await execFileAsync("sqlite3", args, {
    maxBuffer: 1024 * 1024 * 5
  });
  if (!json) return [];
  const trimmed = stdout.trim();
  return trimmed ? JSON.parse(trimmed) : [];
}

async function query(sqlText) {
  return db(sqlText, true);
}

async function queryOne(sqlText) {
  const rows = await query(sqlText);
  return rows[0] || null;
}

function now() {
  return new Date().toISOString();
}

function parseCookies(header = "") {
  return header.split(";").reduce((cookies, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    auth_provider: row.auth_provider || "password"
  };
}

async function currentUser(req) {
  const token = parseCookies(req.headers.cookie).shop_session;
  const userId = token ? sessions.get(token) : null;
  if (!userId) return null;
  return queryOne(`
    SELECT id, name, email, auth_provider
    FROM users
    WHERE id = ${sql(userId)}
  `);
}

function setSession(res, userId) {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, userId);
  res.setHeader(
    "Set-Cookie",
    `shop_session=${encodeURIComponent(token)}; HttpOnly; SameSite=Lax; Path=/; Max-Age=604800`
  );
}

function clearSession(req, res) {
  const token = parseCookies(req.headers.cookie).shop_session;
  if (token) sessions.delete(token);
  res.setHeader("Set-Cookie", "shop_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");
}

async function requireAuth(req, res, next) {
  try {
    const user = await currentUser(req);
    if (!user) {
      res.status(401).json({ error: "Please sign in to continue." });
      return;
    }
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64);
  return { salt, hash: hash.toString("hex") };
}

async function verifyPassword(password, salt, expectedHash) {
  const hash = await scryptAsync(password, salt, 64);
  const actual = Buffer.from(hash.toString("hex"), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cents(value) {
  return Math.round(Number(value) * 100);
}

function normalizeRegion(region) {
  return region === "india" ? "india" : "international";
}

function orderTotals(subtotalCents, region) {
  const config = REGIONS[normalizeRegion(region)];
  const shippingCents =
    subtotalCents >= config.freeShippingThresholdCents || subtotalCents === 0
      ? 0
      : config.shippingCents;
  const taxCents = Math.round(subtotalCents * config.taxRate);
  return {
    subtotalCents,
    shippingCents,
    taxCents,
    totalCents: subtotalCents + shippingCents + taxCents
  };
}

async function ensureColumn(table, column, definition) {
  const columns = await query(`PRAGMA table_info(${table})`);
  if (!columns.some((row) => row.name === column)) {
    await db(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

function productSeedSql() {
  const products = [
    {
      name: "Atlas Everyday Backpack",
      slug: "atlas-everyday-backpack",
      category: "Bags",
      priceCents: 8900,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
      description: "A weather-resistant daily backpack with laptop storage, breathable straps, and clean commuter styling.",
      details: "18L capacity, padded 15 inch laptop sleeve, recycled nylon shell, luggage pass-through, two bottle pockets.",
      stock: 34
    },
    {
      name: "Tempo Wireless Headphones",
      slug: "tempo-wireless-headphones",
      category: "Audio",
      priceCents: 12900,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
      description: "Comfortable over-ear headphones with punchy sound, long battery life, and fast USB-C charging.",
      details: "Active noise reduction, 38 hour playback, fold-flat hinges, memory foam ear cups, dual-device pairing.",
      stock: 22
    },
    {
      name: "Northstar Runner",
      slug: "northstar-runner",
      category: "Footwear",
      priceCents: 11200,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      description: "Lightweight trainers built for city miles, gym sessions, and weekend errands.",
      details: "Responsive foam midsole, knit upper, rubber traction pods, removable insole, reflective heel tab.",
      stock: 18
    },
    {
      name: "Brewline Pour-Over Kit",
      slug: "brewline-pour-over-kit",
      category: "Kitchen",
      priceCents: 6400,
      imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
      description: "A compact pour-over coffee set with a glass carafe, stainless filter, and walnut-handled scoop.",
      details: "600ml borosilicate carafe, reusable steel cone filter, heat-safe collar, measuring scoop, paper-free brewing.",
      stock: 41
    },
    {
      name: "Luma Desk Lamp",
      slug: "luma-desk-lamp",
      category: "Home",
      priceCents: 7800,
      imageUrl: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
      description: "A low-profile LED task lamp with dimming, warm-to-cool color control, and a weighted base.",
      details: "Five brightness settings, adjustable arm, 2700K to 5000K range, touch controls, aluminum body.",
      stock: 27
    },
    {
      name: "Harbor Lounge Chair",
      slug: "harbor-lounge-chair",
      category: "Furniture",
      priceCents: 21900,
      imageUrl: "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=900&q=80",
      description: "A comfortable accent chair with a solid wood frame and textured upholstery.",
      details: "Kiln-dried frame, high-resilience foam, removable cushion, felt floor glides, contract-grade fabric.",
      stock: 9
    }
  ];

  return products
    .map((product) => `
      INSERT INTO products
        (name, slug, category, price_cents, image_url, description, details, stock)
      VALUES
        (${sql(product.name)}, ${sql(product.slug)}, ${sql(product.category)}, ${sql(product.priceCents)},
         ${sql(product.imageUrl)}, ${sql(product.description)}, ${sql(product.details)}, ${sql(product.stock)});
    `)
    .join("\n");
}

function regionalProductSql() {
  const products = [
    {
      name: "Kaveri Filter Coffee Set",
      slug: "kaveri-filter-coffee-set",
      category: "India Edit",
      priceCents: 5200,
      imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
      description: "A compact South Indian filter coffee kit with a steel brewer, tumbler set, and freshly roasted blend.",
      details: "Stainless steel drip filter, two dabarah tumblers, 250g coffee blend, airtight tin, gift-ready packaging.",
      stock: 36
    },
    {
      name: "Jaipur Cotton Weekend Tote",
      slug: "jaipur-cotton-weekend-tote",
      category: "India Edit",
      priceCents: 4200,
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
      description: "A roomy cotton tote with hand-block inspired patterning, reinforced handles, and market-day storage.",
      details: "Organic cotton canvas, inside zip pocket, 22L capacity, washable lining, artisan-inspired print.",
      stock: 44
    },
    {
      name: "Monsoon Travel Jacket",
      slug: "monsoon-travel-jacket",
      category: "India Edit",
      priceCents: 7600,
      imageUrl: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?auto=format&fit=crop&w=900&q=80",
      description: "A lightweight rain shell made for humid commutes, sudden showers, and long-haul travel.",
      details: "Packable hood, vented back panel, water-repellent finish, taped seams, two zipped pockets.",
      stock: 25
    }
  ];

  return products
    .map((product) => `
      INSERT OR IGNORE INTO products
        (name, slug, category, price_cents, image_url, description, details, stock)
      VALUES
        (${sql(product.name)}, ${sql(product.slug)}, ${sql(product.category)}, ${sql(product.priceCents)},
         ${sql(product.imageUrl)}, ${sql(product.description)}, ${sql(product.details)}, ${sql(product.stock)});
    `)
    .join("\n");
}

async function initializeDatabase() {
  fs.mkdirSync(DATA_DIR, { recursive: true });

  await db(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      auth_provider TEXT NOT NULL DEFAULT 'password',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL,
      price_cents INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      details TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      cart_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      PRIMARY KEY (cart_id, product_id),
      FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      subtotal_cents INTEGER NOT NULL,
      shipping_cents INTEGER NOT NULL,
      tax_cents INTEGER NOT NULL,
      total_cents INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      zip TEXT NOT NULL,
      region TEXT NOT NULL DEFAULT 'international',
      status TEXT NOT NULL DEFAULT 'placed',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_id INTEGER NOT NULL,
      product_name TEXT NOT NULL,
      unit_price_cents INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );
  `);

  await ensureColumn("users", "auth_provider", "TEXT NOT NULL DEFAULT 'password'");
  await ensureColumn("orders", "region", "TEXT NOT NULL DEFAULT 'international'");

  const existing = await queryOne("SELECT COUNT(*) AS count FROM products");
  if (!existing || existing.count === 0) {
    await db(productSeedSql());
  }
  await db(regionalProductSql());
}

async function getActiveCart(userId) {
  let cart = await queryOne(`
    SELECT id, user_id
    FROM carts
    WHERE user_id = ${sql(userId)} AND status = 'active'
    ORDER BY id DESC
    LIMIT 1
  `);

  if (!cart) {
    const rows = await query(`
      INSERT INTO carts (user_id, status, created_at, updated_at)
      VALUES (${sql(userId)}, 'active', ${sql(now())}, ${sql(now())});
      SELECT last_insert_rowid() AS id;
    `);
    cart = { id: rows[0].id, user_id: userId };
  }

  return cart;
}

async function getCartPayload(userId) {
  const cart = await getActiveCart(userId);
  const items = await query(`
    SELECT
      p.id AS product_id,
      p.name,
      p.slug,
      p.price_cents,
      p.image_url,
      p.stock,
      ci.quantity,
      (p.price_cents * ci.quantity) AS line_total_cents
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
    WHERE ci.cart_id = ${sql(cart.id)}
    ORDER BY p.name
  `);

  const subtotalCents = items.reduce((sum, item) => sum + item.line_total_cents, 0);
  return {
    id: cart.id,
    items,
    subtotal_cents: subtotalCents,
    item_count: items.reduce((sum, item) => sum + item.quantity, 0)
  };
}

app.get("/api/products", async (req, res, next) => {
  try {
    const products = await query(`
      SELECT id, name, slug, category, price_cents, image_url, description, details, stock
      FROM products
      ORDER BY category, name
    `);
    res.json({ products });
  } catch (error) {
    next(error);
  }
});

app.get("/api/products/:slug", async (req, res, next) => {
  try {
    const product = await queryOne(`
      SELECT id, name, slug, category, price_cents, image_url, description, details, stock
      FROM products
      WHERE slug = ${sql(req.params.slug)}
    `);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }
    res.json({ product });
  } catch (error) {
    next(error);
  }
});

app.post("/api/register", async (req, res, next) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    if (name.length < 2) {
      res.status(400).json({ error: "Enter your name." });
      return;
    }
    if (!validateEmail(email)) {
      res.status(400).json({ error: "Enter a valid email address." });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: "Password must be at least 6 characters." });
      return;
    }

    const existing = await queryOne(`SELECT id FROM users WHERE email = ${sql(email)}`);
    if (existing) {
      res.status(409).json({ error: "An account with that email already exists." });
      return;
    }

    const { salt, hash } = await hashPassword(password);
    const rows = await query(`
      INSERT INTO users (name, email, password_hash, salt, auth_provider, created_at)
      VALUES (${sql(name)}, ${sql(email)}, ${sql(hash)}, ${sql(salt)}, 'password', ${sql(now())});
      SELECT id, name, email, auth_provider FROM users WHERE id = last_insert_rowid();
    `);
    const user = rows[0];
    setSession(res, user.id);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/login", async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const user = await queryOne(`
      SELECT id, name, email, password_hash, salt, auth_provider
      FROM users
      WHERE email = ${sql(email)}
    `);

    if (!user || !(await verifyPassword(password, user.salt, user.password_hash))) {
      res.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    setSession(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/social-login", async (req, res, next) => {
  try {
    const providerKey = String(req.body.provider || "").trim().toLowerCase();
    const provider = SOCIAL_PROVIDERS[providerKey];
    if (!provider) {
      res.status(400).json({ error: "Choose Google, Apple ID, or Microsoft sign in." });
      return;
    }

    let user = await queryOne(`
      SELECT id, name, email, auth_provider
      FROM users
      WHERE email = ${sql(provider.email)}
    `);

    if (!user) {
      const { salt, hash } = await hashPassword(crypto.randomUUID());
      const rows = await query(`
        INSERT INTO users (name, email, password_hash, salt, auth_provider, created_at)
        VALUES (${sql(provider.name)}, ${sql(provider.email)}, ${sql(hash)}, ${sql(salt)}, ${sql(providerKey)}, ${sql(now())});
        SELECT id, name, email, auth_provider FROM users WHERE id = last_insert_rowid();
      `);
      user = rows[0];
    } else if (user.auth_provider !== providerKey) {
      await db(`
        UPDATE users
        SET auth_provider = ${sql(providerKey)}
        WHERE id = ${sql(user.id)}
      `);
      user.auth_provider = providerKey;
    }

    setSession(res, user.id);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/auth/:provider", (req, res) => {
  const provider = String(req.params.provider || "").trim().toLowerCase();
  if (!["google", "apple", "microsoft"].includes(provider)) {
    return res.status(400).send("Invalid auth provider.");
  }
  
  const hasCreds = {
    google: process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
    microsoft: process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET
  };

  if (hasCreds[provider]) {
    if (provider === "google") {
      const redirectUri = `${req.protocol}://${req.get("host")}/auth/google/callback`;
      const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email`;
      return res.redirect(url);
    }
    if (provider === "microsoft") {
      const redirectUri = `${req.protocol}://${req.get("host")}/auth/microsoft/callback`;
      const url = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20profile%20email%20User.Read`;
      return res.redirect(url);
    }
  }

  res.redirect(`/simulated-login.html?provider=${provider}`);
});

app.post("/auth/simulated/submit", async (req, res, next) => {
  try {
    const provider = String(req.body.provider || "").trim().toLowerCase();
    const email = String(req.body.email || "").trim().toLowerCase();
    const name = String(req.body.name || "").trim();

    if (!["google", "apple", "microsoft"].includes(provider)) {
      return res.status(400).send("Invalid provider");
    }
    if (!email || !validateEmail(email)) {
      return res.status(400).send("Invalid email");
    }
    if (!name) {
      return res.status(400).send("Name is required");
    }

    let user = await queryOne(`
      SELECT id, name, email, auth_provider
      FROM users
      WHERE email = ${sql(email)}
    `);

    if (!user) {
      const { salt, hash } = await hashPassword(crypto.randomUUID());
      const rows = await query(`
        INSERT INTO users (name, email, password_hash, salt, auth_provider, created_at)
        VALUES (${sql(name)}, ${sql(email)}, ${sql(hash)}, ${sql(salt)}, ${sql(provider)}, ${sql(now())});
        SELECT id, name, email, auth_provider FROM users WHERE id = last_insert_rowid();
      `);
      user = rows[0];
    } else {
      if (user.auth_provider !== provider) {
        await db(`
          UPDATE users
          SET auth_provider = ${sql(provider)}, name = ${sql(name)}
          WHERE id = ${sql(user.id)}
        `);
        user.auth_provider = provider;
        user.name = name;
      }
    }

    setSession(res, user.id);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Auth Success</title>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: "auth_success" }, window.location.origin);
          }
          window.close();
        </script>
      </head>
      <body>
        <p style="font-family: system-ui, sans-serif; text-align: center; margin-top: 50px;">
          Authentication successful! Closing window...
        </p>
      </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

app.get("/auth/google/callback", async (req, res, next) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send("No code returned from Google");
  }
  try {
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.id_token) {
      return res.status(400).send("Failed to retrieve Google ID token");
    }

    const payloadBase64 = tokens.id_token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
    const email = payload.email.toLowerCase();
    const name = payload.name || "Google User";

    let user = await queryOne(`SELECT id, name, email, auth_provider FROM users WHERE email = ${sql(email)}`);
    if (!user) {
      const { salt, hash } = await hashPassword(crypto.randomUUID());
      const rows = await query(`
        INSERT INTO users (name, email, password_hash, salt, auth_provider, created_at)
        VALUES (${sql(name)}, ${sql(email)}, ${sql(hash)}, ${sql(salt)}, 'google', ${sql(now())});
        SELECT id, name, email, auth_provider FROM users WHERE id = last_insert_rowid();
      `);
      user = rows[0];
    } else if (user.auth_provider !== "google") {
      await db(`UPDATE users SET auth_provider = 'google' WHERE id = ${sql(user.id)}`);
      user.auth_provider = "google";
    }

    setSession(res, user.id);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          if (window.opener) window.opener.postMessage({ type: "auth_success" }, window.location.origin);
          window.close();
        </script>
      </head>
      <body>Success! Closing...</body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

app.get("/auth/microsoft/callback", async (req, res, next) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code returned from Microsoft");
  try {
    const redirectUri = `${req.protocol}://${req.get("host")}/auth/microsoft/callback`;
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.MICROSOFT_CLIENT_ID,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });
    const tokens = await tokenRes.json();
    if (!tokens.id_token) return res.status(400).send("Failed to retrieve Microsoft ID token");

    const payloadBase64 = tokens.id_token.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadBase64, "base64").toString());
    const email = (payload.email || payload.preferred_username || "").toLowerCase();
    const name = payload.name || "Microsoft User";

    if (!email) return res.status(400).send("Email not provided by Microsoft");

    let user = await queryOne(`SELECT id, name, email, auth_provider FROM users WHERE email = ${sql(email)}`);
    if (!user) {
      const { salt, hash } = await hashPassword(crypto.randomUUID());
      const rows = await query(`
        INSERT INTO users (name, email, password_hash, salt, auth_provider, created_at)
        VALUES (${sql(name)}, ${sql(email)}, ${sql(hash)}, ${sql(salt)}, 'microsoft', ${sql(now())});
        SELECT id, name, email, auth_provider FROM users WHERE id = last_insert_rowid();
      `);
      user = rows[0];
    } else if (user.auth_provider !== "microsoft") {
      await db(`UPDATE users SET auth_provider = 'microsoft' WHERE id = ${sql(user.id)}`);
      user.auth_provider = "microsoft";
    }

    setSession(res, user.id);
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <script>
          if (window.opener) window.opener.postMessage({ type: "auth_success" }, window.location.origin);
          window.close();
        </script>
      </head>
      <body>Success! Closing...</body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
});

app.post("/api/logout", async (req, res, next) => {
  try {
    clearSession(req, res);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/me", async (req, res, next) => {
  try {
    const user = await currentUser(req);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/cart", requireAuth, async (req, res, next) => {
  try {
    res.json({ cart: await getCartPayload(req.user.id) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/cart/items", requireAuth, async (req, res, next) => {
  try {
    const productId = Number(req.body.productId);
    const quantity = Math.max(1, Math.min(20, Number(req.body.quantity || 1)));
    if (!Number.isInteger(productId)) {
      res.status(400).json({ error: "Invalid product." });
      return;
    }

    const product = await queryOne(`
      SELECT id, stock
      FROM products
      WHERE id = ${sql(productId)}
    `);
    if (!product) {
      res.status(404).json({ error: "Product not found." });
      return;
    }

    const cart = await getActiveCart(req.user.id);
    const current = await queryOne(`
      SELECT quantity
      FROM cart_items
      WHERE cart_id = ${sql(cart.id)} AND product_id = ${sql(productId)}
    `);
    const nextQuantity = Math.min(product.stock, (current ? current.quantity : 0) + quantity);

    await db(`
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES (${sql(cart.id)}, ${sql(productId)}, ${sql(nextQuantity)})
      ON CONFLICT(cart_id, product_id) DO UPDATE SET quantity = excluded.quantity;

      UPDATE carts
      SET updated_at = ${sql(now())}
      WHERE id = ${sql(cart.id)};
    `);

    res.status(201).json({ cart: await getCartPayload(req.user.id) });
  } catch (error) {
    next(error);
  }
});

app.patch("/api/cart/items/:productId", requireAuth, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const quantity = Math.max(0, Math.min(20, Number(req.body.quantity || 0)));
    if (!Number.isInteger(productId) || !Number.isInteger(quantity)) {
      res.status(400).json({ error: "Invalid cart item." });
      return;
    }

    const cart = await getActiveCart(req.user.id);
    if (quantity === 0) {
      await db(`
        DELETE FROM cart_items
        WHERE cart_id = ${sql(cart.id)} AND product_id = ${sql(productId)};
      `);
    } else {
      const product = await queryOne(`SELECT stock FROM products WHERE id = ${sql(productId)}`);
      const safeQuantity = Math.min(product ? product.stock : 0, quantity);
      await db(`
        UPDATE cart_items
        SET quantity = ${sql(safeQuantity)}
        WHERE cart_id = ${sql(cart.id)} AND product_id = ${sql(productId)};
      `);
    }

    await db(`UPDATE carts SET updated_at = ${sql(now())} WHERE id = ${sql(cart.id)}`);
    res.json({ cart: await getCartPayload(req.user.id) });
  } catch (error) {
    next(error);
  }
});

app.delete("/api/cart/items/:productId", requireAuth, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const cart = await getActiveCart(req.user.id);
    await db(`
      DELETE FROM cart_items
      WHERE cart_id = ${sql(cart.id)} AND product_id = ${sql(productId)};

      UPDATE carts
      SET updated_at = ${sql(now())}
      WHERE id = ${sql(cart.id)};
    `);
    res.json({ cart: await getCartPayload(req.user.id) });
  } catch (error) {
    next(error);
  }
});

app.post("/api/orders", requireAuth, async (req, res, next) => {
  try {
    const fields = ["fullName", "email", "address", "city", "state", "zip"];
    const form = Object.fromEntries(
      fields.map((field) => [field, String(req.body[field] || "").trim()])
    );

    if (!form.fullName || !validateEmail(form.email) || !form.address || !form.city || !form.state || !form.zip) {
      res.status(400).json({ error: "Complete all checkout fields." });
      return;
    }

    const cart = await getCartPayload(req.user.id);
    if (cart.items.length === 0) {
      res.status(400).json({ error: "Your cart is empty." });
      return;
    }

    const region = normalizeRegion(req.body.region);
    const { subtotalCents, shippingCents, taxCents, totalCents } = orderTotals(cart.subtotal_cents, region);
    const orderId = crypto.randomUUID();

    const itemSql = cart.items.map((item) => `
      INSERT INTO order_items
        (order_id, product_id, product_name, unit_price_cents, quantity)
      VALUES
        (${sql(orderId)}, ${sql(item.product_id)}, ${sql(item.name)}, ${sql(item.price_cents)}, ${sql(item.quantity)});

      UPDATE products
      SET stock = stock - ${sql(item.quantity)}
      WHERE id = ${sql(item.product_id)} AND stock >= ${sql(item.quantity)};
    `).join("\n");

    await db(`
      PRAGMA foreign_keys = ON;
      BEGIN TRANSACTION;

      INSERT INTO orders
        (id, user_id, subtotal_cents, shipping_cents, tax_cents, total_cents,
         full_name, email, address, city, state, zip, region, status, created_at)
      VALUES
        (${sql(orderId)}, ${sql(req.user.id)}, ${sql(subtotalCents)}, ${sql(shippingCents)}, ${sql(taxCents)}, ${sql(totalCents)},
         ${sql(form.fullName)}, ${sql(form.email)}, ${sql(form.address)}, ${sql(form.city)}, ${sql(form.state)}, ${sql(form.zip)},
         ${sql(region)}, 'placed', ${sql(now())});

      ${itemSql}

      DELETE FROM cart_items WHERE cart_id = ${sql(cart.id)};
      UPDATE carts SET status = 'checked_out', updated_at = ${sql(now())} WHERE id = ${sql(cart.id)};

      COMMIT;
    `);

    const order = await queryOne(`
      SELECT id, subtotal_cents, shipping_cents, tax_cents, total_cents, region, status, created_at
      FROM orders
      WHERE id = ${sql(orderId)}
    `);

    res.status(201).json({ order });
  } catch (error) {
    next(error);
  }
});

app.get("/api/orders", requireAuth, async (req, res, next) => {
  try {
    const orders = await query(`
      SELECT id, subtotal_cents, shipping_cents, tax_cents, total_cents, region, status, created_at
      FROM orders
      WHERE user_id = ${sql(req.user.id)}
      ORDER BY created_at DESC
    `);

    for (const order of orders) {
      order.items = await query(`
        SELECT product_name, unit_price_cents, quantity
        FROM order_items
        WHERE order_id = ${sql(order.id)}
        ORDER BY id
      `);
    }

    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Something went wrong. Please try again." });
});

initializeDatabase()
  .then(() => {
    app.listen(PORT, HOST, () => {
      console.log(`E-commerce site running at http://${HOST}:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Unable to initialize the database:", error);
    process.exit(1);
  });
