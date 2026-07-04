// Techpedia Frontend Core - Instagram & Snapchat Replica Features
let state = {
  currentUser: null,
  currentTab: 'feed',
  feedFilter: 'global',
  usersList: [],
  activeProfileUsername: null,
  selectedAvatarUrl: '',
  
  // Advanced Features State
  storiesGroups: [], // Stories grouped by user
  activeStoryGroupIndex: 0,
  activeStoryItemIndex: 0,
  storyTimer: null,
  
  activeChatUserId: null,
  chatPollInterval: null,
  
  selectedPostFilter: 'filter-original',
  selectedStoryPresetUrl: ''
};

// Preset high quality photos
const PHOTO_PRESETS = [
  { name: "Cyberpunk", url: "https://images.unsplash.com/photo-1515621061946-eff1c2a352bd?auto=format&fit=crop&w=600&q=80" },
  { name: "Future Servers", url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80" },
  { name: "Neon Code", url: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=600&q=80" },
  { name: "Sci-Fi Space", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80" },
  { name: "Coffee & Code", url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80" }
];

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&h=150&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80"
];

// Views
const viewFeed = document.getElementById("viewFeed");
const viewExplore = document.getElementById("viewExplore");
const viewChats = document.getElementById("viewChats");
const viewProfile = document.getElementById("viewProfile");
const viewAuth = document.getElementById("viewAuth");

// Navigation
const tabFeedBtn = document.getElementById("tabFeedBtn");
const tabExploreBtn = document.getElementById("tabExploreBtn");
const tabChatsBtn = document.getElementById("tabChatsBtn");
const tabProfileBtn = document.getElementById("tabProfileBtn");
const quickCreateBtn = document.getElementById("quickCreateBtn");
const quickStoryBtn = document.getElementById("quickStoryBtn");
const logoutBtn = document.getElementById("logoutBtn");
const sidebarActionArea = document.getElementById("sidebarActionArea");

const currentUserHeader = document.getElementById("currentUserHeader");
const myAvatar = document.getElementById("myAvatar");
const myName = document.getElementById("myName");
const myUsername = document.getElementById("myUsername");

// dynamic lists
const postsFeedContainer = document.getElementById("postsFeedContainer");
const exploreUsersGrid = document.getElementById("exploreUsersGrid");
const profilePostsContainer = document.getElementById("profilePostsContainer");
const rightSuggestionsContainer = document.getElementById("rightSuggestionsContainer");
const chatThreadsContainer = document.getElementById("chatThreadsContainer");

const feedTypeGlobal = document.getElementById("feedTypeGlobal");
const feedTypeFollowing = document.getElementById("feedTypeFollowing");

const createPostCard = document.getElementById("createPostCard");
const createPostForm = document.getElementById("createPostForm");
const createPostAvatar = document.getElementById("createPostAvatar");
const postContentInput = document.getElementById("postContentInput");
const postImageInput = document.getElementById("postImageInput");

const searchUserInput = document.getElementById("searchUserInput");

// Modals
const setupProfileDialog = document.getElementById("setupProfileDialog");
const setupProfileForm = document.getElementById("setupProfileForm");
const setupUsernameInput = document.getElementById("setupUsername");
const setupBioInput = document.getElementById("setupBio");
const setupAvatarInput = document.getElementById("setupAvatar");
const setupAvatarOptions = document.getElementById("setupAvatarOptions");
const setupProfileError = document.getElementById("setupProfileError");

const editProfileDialog = document.getElementById("editProfileDialog");
const editProfileForm = document.getElementById("editProfileForm");
const editDisplayNameInput = document.getElementById("editDisplayName");
const editBioInput = document.getElementById("editBio");
const editAvatarInput = document.getElementById("editAvatar");
const editAvatarOptions = document.getElementById("editAvatarOptions");
const editProfileError = document.getElementById("editProfileError");

const closeEditProfileBtn = document.getElementById("closeEditProfileBtn");
const cancelEditProfileBtn = document.getElementById("cancelEditProfileBtn");

// ----------------------------------------------------
// STORIES & CHAT MODAL ELEMENTS
// ----------------------------------------------------
const addStoryDialog = document.getElementById("addStoryDialog");
const addStoryForm = document.getElementById("addStoryForm");
const storyImageUrlInput = document.getElementById("storyImageUrl");
const storyCaptionInput = document.getElementById("storyCaption");
const storyPresetsGrid = document.getElementById("storyPresetsGrid");
const closeAddStoryBtn = document.getElementById("closeAddStoryBtn");
const cancelAddStoryBtn = document.getElementById("cancelAddStoryBtn");
const storyError = document.getElementById("storyError");

const storyViewerDialog = document.getElementById("storyViewerDialog");
const storyProgressWrapper = document.getElementById("storyProgressWrapper");
const storyViewerAvatar = document.getElementById("storyViewerAvatar");
const storyViewerName = document.getElementById("storyViewerName");
const storyViewerTime = document.getElementById("storyViewerTime");
const storyViewerImg = document.getElementById("storyViewerImg");
const storyViewerCaption = document.getElementById("storyViewerCaption");
const closeStoryViewerBtn = document.getElementById("closeStoryViewerBtn");
const storyPrevBtn = document.getElementById("storyPrevBtn");
const storyNextBtn = document.getElementById("storyNextBtn");

// Post Detail Modal
const postDetailDialog = document.getElementById("postDetailDialog");
const closePostDetailBtn = document.getElementById("closePostDetailBtn");
const detailPostImg = document.getElementById("detailPostImg");
const detailAuthorAvatar = document.getElementById("detailAuthorAvatar");
const detailAuthorName = document.getElementById("detailAuthorName");
const detailAuthorUsername = document.getElementById("detailAuthorUsername");
const detailDeleteBtn = document.getElementById("detailDeleteBtn");
const detailPostContent = document.getElementById("detailPostContent");
const detailPostTime = document.getElementById("detailPostTime");
const detailCommentsList = document.getElementById("detailCommentsList");
const detailLikesCount = document.getElementById("detailLikesCount");
const detailCommentForm = document.getElementById("detailCommentForm");

// ----------------------------------------------------
// INITIALIZATION
// ----------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  setupAppEvents();
  renderAvatarOptions(setupAvatarOptions, setupAvatarInput);
  renderAvatarOptions(editAvatarOptions, editAvatarInput);
  renderPresetImages();
  renderStoryPresets();
  await checkAuthStatus();
});

// Check Session Auth Status
async function checkAuthStatus() {
  try {
    const res = await fetch("/api/social/me");
    const data = await res.json();
    
    if (data.loggedIn) {
      state.currentUser = data.user;
      
      if (data.user.usernameRequired) {
        setupProfileDialog.showModal();
        return;
      }
      
      setupUserUIState();
      await navigate("feed");
      loadRightSidebarSuggestions();
    } else {
      showView("auth");
    }
  } catch (error) {
    console.error("Auth failed:", error);
    showView("auth");
  }
}

function setupUserUIState() {
  myAvatar.src = state.currentUser.avatar_url || AVATAR_PRESETS[0];
  myName.textContent = state.currentUser.name;
  myUsername.textContent = `@${state.currentUser.username}`;
  createPostAvatar.src = state.currentUser.avatar_url || AVATAR_PRESETS[0];
  
  currentUserHeader.classList.remove("hidden");
  sidebarActionArea.classList.remove("hidden");
  createPostCard.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");
}

function showView(viewName) {
  viewFeed.classList.add("hidden");
  viewExplore.classList.add("hidden");
  viewChats.classList.add("hidden");
  viewProfile.classList.add("hidden");
  viewAuth.classList.add("hidden");
  
  // Stop chat polling if leaving chat tab
  if (viewName !== 'chats' && state.chatPollInterval) {
    clearInterval(state.chatPollInterval);
    state.chatPollInterval = null;
  }
  
  if (viewName === 'feed') viewFeed.classList.remove("hidden");
  else if (viewName === 'explore') viewExplore.classList.remove("hidden");
  else if (viewName === 'chats') viewChats.classList.remove("hidden");
  else if (viewName === 'profile') viewProfile.classList.remove("hidden");
  else if (viewName === 'auth') viewAuth.classList.remove("hidden");
}

async function navigate(tabName, extraData = null) {
  state.currentTab = tabName;
  
  tabFeedBtn.classList.remove("active");
  tabExploreBtn.classList.remove("active");
  tabChatsBtn.classList.remove("active");
  tabProfileBtn.classList.remove("active");
  
  if (tabName === 'feed') {
    tabFeedBtn.classList.add("active");
    showView("feed");
    await loadFeed();
    await loadStories();
  } else if (tabName === 'explore') {
    tabExploreBtn.classList.add("active");
    showView("explore");
    await loadExplore();
  } else if (tabName === 'chats') {
    tabChatsBtn.classList.add("active");
    showView("chats");
    await loadChats();
  } else if (tabName === 'profile') {
    if (!extraData || extraData === state.currentUser.username) {
      tabProfileBtn.classList.add("active");
    }
    showView("profile");
    const username = extraData || state.currentUser.username;
    await loadUserProfile(username);
  }
}

// ----------------------------------------------------
// APP EVENT LISTENERS BINDINGS
// ----------------------------------------------------
function setupAppEvents() {
  tabFeedBtn.addEventListener("click", () => navigate("feed"));
  tabExploreBtn.addEventListener("click", () => navigate("explore"));
  tabChatsBtn.addEventListener("click", () => navigate("chats"));
  tabProfileBtn.addEventListener("click", () => navigate("profile", state.currentUser.username));
  
  quickCreateBtn.addEventListener("click", () => {
    navigate("feed");
    postContentInput.focus();
  });
  
  quickStoryBtn.addEventListener("click", () => {
    storyImageUrlInput.value = "";
    storyCaptionInput.value = "";
    addStoryDialog.showModal();
  });
  
  document.getElementById("addStoryTrigger").addEventListener("click", () => {
    storyImageUrlInput.value = "";
    storyCaptionInput.value = "";
    addStoryDialog.showModal();
  });
  
  // Feed Toggle Filter
  feedTypeGlobal.addEventListener("click", () => {
    feedTypeGlobal.classList.add("active");
    feedTypeFollowing.classList.remove("active");
    state.feedFilter = "global";
    loadFeed();
  });
  
  feedTypeFollowing.addEventListener("click", () => {
    feedTypeFollowing.classList.add("active");
    feedTypeGlobal.classList.remove("active");
    state.feedFilter = "following";
    loadFeed();
  });

  // Creator preset toggle
  const toggleImagePresetsBtn = document.getElementById("toggleImagePresetsBtn");
  const imagePresetsDrawer = document.getElementById("imagePresetsDrawer");
  toggleImagePresetsBtn.addEventListener("click", () => {
    imagePresetsDrawer.classList.toggle("hidden");
  });

  // Live filter studio handlers
  const filterStudio = document.getElementById("filterStudio");
  const studioPreviewImg = document.getElementById("studioPreviewImg");
  const activeFilterLabel = document.getElementById("activeFilterLabel");

  postImageInput.addEventListener("input", () => {
    const url = postImageInput.value.trim();
    if (url) {
      studioPreviewImg.src = url;
      filterStudio.classList.remove("hidden");
    } else {
      filterStudio.classList.add("hidden");
    }
  });

  // Image Presets Selection
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("preset-img-option")) {
      const url = e.target.getAttribute("data-url");
      postImageInput.value = url;
      studioPreviewImg.src = url;
      filterStudio.classList.remove("hidden");
      
      document.querySelectorAll(".preset-img-option").forEach(el => el.classList.remove("selected"));
      e.target.classList.add("selected");
    }
  });

  // Preset Filters Select Action
  document.querySelectorAll(".filter-preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-preset-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      
      const filter = btn.getAttribute("data-filter");
      state.selectedPostFilter = `filter-${filter}`;
      activeFilterLabel.textContent = `Filter: ${btn.textContent}`;
      
      // Update preview image class
      studioPreviewImg.className = "";
      if (filter !== "original") {
        studioPreviewImg.classList.add(`filter-${filter}`);
      }
    });
  });

  // Submit Post
  createPostForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = postContentInput.value.trim();
    const imageUrl = postImageInput.value.trim();
    const filterStyle = imageUrl ? state.selectedPostFilter : '';
    
    if (!content) return;
    
    try {
      const res = await fetch("/api/social/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, image_url: imageUrl, filter_style: filterStyle })
      });
      const data = await res.json();
      
      if (res.ok) {
        postContentInput.value = "";
        postImageInput.value = "";
        filterStudio.classList.add("hidden");
        imagePresetsDrawer.classList.add("hidden");
        document.querySelectorAll(".preset-img-option").forEach(el => el.classList.remove("selected"));
        
        // Reset filters
        document.querySelectorAll(".filter-preset-btn").forEach(b => b.classList.remove("active"));
        document.querySelector("[data-filter='original']").classList.add("active");
        state.selectedPostFilter = 'filter-original';
        activeFilterLabel.textContent = "Filter: Original";
        studioPreviewImg.className = "";
        
        if (state.currentTab === "feed") loadFeed();
        else if (state.currentTab === "profile" && state.activeProfileUsername === state.currentUser.username) {
          loadUserProfile(state.currentUser.username);
        }
      } else {
        alert(data.error || "Post creation failed.");
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Story presets clicks
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("story-preset-option")) {
      const url = e.target.getAttribute("data-url");
      storyImageUrlInput.value = url;
      document.querySelectorAll(".story-preset-option").forEach(el => el.classList.remove("selected"));
      e.target.classList.add("selected");
    }
  });

  // Submit Story
  addStoryForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const imageUrl = storyImageUrlInput.value.trim();
    const caption = storyCaptionInput.value.trim();
    
    storyError.classList.add("hidden");
    
    try {
      const res = await fetch("/api/social/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, caption })
      });
      const data = await res.json();
      
      if (res.ok) {
        addStoryDialog.close();
        if (state.currentTab === "feed") {
          loadStories();
          loadFeed();
        }
      } else {
        storyError.textContent = data.error || "Failed to post story.";
        storyError.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
    }
  });

  closeAddStoryBtn.addEventListener("click", () => addStoryDialog.close());
  cancelAddStoryBtn.addEventListener("click", () => addStoryDialog.close());

  // Search User
  searchUserInput.addEventListener("input", () => {
    if (state.currentTab === "explore") {
      renderExploreUsersGrid();
    } else {
      navigate("explore").then(() => {
        searchUserInput.focus();
      });
    }
  });

  // Logout
  logoutBtn.addEventListener("click", async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  });

  // Auth Forms
  const authTabLogin = document.getElementById("authTabLogin");
  const authTabSignup = document.getElementById("authTabSignup");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  
  authTabLogin.addEventListener("click", () => {
    authTabLogin.classList.add("active");
    authTabSignup.classList.remove("active");
    loginForm.classList.remove("hidden");
    signupForm.classList.add("hidden");
  });
  
  authTabSignup.addEventListener("click", () => {
    authTabSignup.classList.add("active");
    authTabLogin.classList.remove("active");
    signupForm.classList.remove("hidden");
    loginForm.classList.add("hidden");
  });
  
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const errorDiv = document.getElementById("loginError");
    errorDiv.classList.add("hidden");
    
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) await checkAuthStatus();
      else {
        errorDiv.textContent = data.error || "Login failed.";
        errorDiv.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
    }
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value.trim();
    const username = document.getElementById("signupUsername").value.trim().toLowerCase();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const errorDiv = document.getElementById("signupError");
    errorDiv.classList.add("hidden");
    
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        // setup social profile
        const socialRes = await fetch("/api/social/setup-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username,
            bio: "Builder on Techpedia",
            avatar_url: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)]
          })
        });
        await checkAuthStatus();
      } else {
        errorDiv.textContent = data.error || "Registration failed.";
        errorDiv.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
    }
  });

  setupProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = setupUsernameInput.value.trim().toLowerCase();
    const bio = setupBioInput.value.trim();
    const avatarUrl = setupAvatarInput.value.trim() || state.selectedAvatarUrl;
    
    setupProfileError.classList.add("hidden");
    try {
      const res = await fetch("/api/social/setup-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, bio, avatar_url: avatarUrl })
      });
      const data = await res.json();
      if (res.ok) {
        setupProfileDialog.close();
        await checkAuthStatus();
      } else {
        setupProfileError.textContent = data.error || "Setup failed.";
        setupProfileError.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
    }
  });

  editProfileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = editDisplayNameInput.value.trim();
    const bio = editBioInput.value.trim();
    const avatarUrl = editAvatarInput.value.trim() || state.selectedAvatarUrl;
    
    editProfileError.classList.add("hidden");
    try {
      const res = await fetch("/api/social/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, avatar_url: avatarUrl })
      });
      if (res.ok) {
        editProfileDialog.close();
        await checkAuthStatus();
        if (state.currentTab === "profile") loadUserProfile(state.currentUser.username);
      } else {
        const data = await res.json();
        editProfileError.textContent = data.error || "Update failed.";
        editProfileError.classList.remove("hidden");
      }
    } catch (err) {
      console.error(err);
    }
  });

  closeEditProfileBtn.addEventListener("click", () => editProfileDialog.close());
  cancelEditProfileBtn.addEventListener("click", () => editProfileDialog.close());

  // STORY VIEWER CONTROLS
  closeStoryViewerBtn.addEventListener("click", closeStoryViewer);
  storyPrevBtn.addEventListener("click", showPrevStory);
  storyNextBtn.addEventListener("click", showNextStory);

  // Chat message form
  const chatMessageForm = document.getElementById("chatMessageForm");
  chatMessageForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("chatMessageInput");
    const content = input.value.trim();
    if (!content || !state.activeChatUserId) return;
    
    try {
      const res = await fetch(`/api/social/chats/${state.activeChatUserId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        input.value = "";
        await loadMessages(state.activeChatUserId, false); // load fresh, don't trigger loader
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Post Detail Comment submit
  detailCommentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = detailCommentForm.querySelector("input");
    const content = input.value.trim();
    const postId = detailCommentForm.getAttribute("data-post-id");
    if (!content || !postId) return;
    
    try {
      const res = await fetch(`/api/social/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        input.value = "";
        
        // increment comment count
        const countElement = document.getElementById("detailLikesCount").parentNode.parentNode.querySelector(".detail-like-btn span"); // placeholder lookup
        // reload comments
        await loadComments(postId, detailCommentsList);
        // reload feed in background
        if (state.currentTab === "feed") loadFeed();
      }
    } catch (err) {
      console.error(err);
    }
  });

  closePostDetailBtn.addEventListener("click", () => postDetailDialog.close());
}

// ----------------------------------------------------
// STORIES CONTROLLER (Snapchat progress bars)
// ----------------------------------------------------
async function loadStories() {
  const container = document.getElementById("activeStoriesContainer");
  container.innerHTML = "";
  
  try {
    const res = await fetch("/api/social/stories");
    const data = await res.json();
    
    if (res.ok) {
      state.storiesGroups = data.stories;
      
      if (data.stories.length === 0) {
        return;
      }
      
      data.stories.forEach((group, index) => {
        const item = document.createElement("div");
        item.className = "story-item";
        
        const avatar = group.author.avatar_url || AVATAR_PRESETS[0];
        
        item.innerHTML = `
          <div class="story-ring">
            <img src="${avatar}" alt="${group.author.name}">
          </div>
          <span class="story-username-label">@${group.author.username}</span>
        `;
        
        item.addEventListener("click", () => openStoryViewer(index));
        container.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function openStoryViewer(groupIndex) {
  state.activeStoryGroupIndex = groupIndex;
  state.activeStoryItemIndex = 0;
  storyViewerDialog.showModal();
  renderActiveStory();
}

function renderActiveStory() {
  if (state.storyTimer) {
    clearTimeout(state.storyTimer);
  }
  
  const group = state.storiesGroups[state.activeStoryGroupIndex];
  const story = group.items[state.activeStoryItemIndex];
  
  // Hydrate UI
  storyViewerAvatar.src = group.author.avatar_url || AVATAR_PRESETS[0];
  storyViewerName.textContent = group.author.name;
  storyViewerTime.textContent = formatRelativeTime(story.created_at);
  storyViewerImg.src = story.image_url;
  storyViewerCaption.textContent = story.caption || "";
  storyViewerCaption.classList.toggle("hidden", !story.caption);
  
  // Setup Progress segments
  storyProgressWrapper.innerHTML = "";
  group.items.forEach((item, idx) => {
    const segment = document.createElement("div");
    segment.className = "story-progress-bar";
    
    const fill = document.createElement("div");
    fill.className = "story-progress-fill";
    
    if (idx < state.activeStoryItemIndex) {
      fill.classList.add("completed");
    } else if (idx === state.activeStoryItemIndex) {
      fill.classList.add("active");
    }
    
    segment.appendChild(fill);
    storyProgressWrapper.appendChild(segment);
  });
  
  // Auto advance story in 5 seconds
  state.storyTimer = setTimeout(() => {
    showNextStory();
  }, 5000);
}

function showNextStory() {
  const group = state.storiesGroups[state.activeStoryGroupIndex];
  
  if (state.activeStoryItemIndex < group.items.length - 1) {
    state.activeStoryItemIndex++;
    renderActiveStory();
  } else {
    // Check if there is another story group
    if (state.activeStoryGroupIndex < state.storiesGroups.length - 1) {
      state.activeStoryGroupIndex++;
      state.activeStoryItemIndex = 0;
      renderActiveStory();
    } else {
      // No more stories, close
      closeStoryViewer();
    }
  }
}

function showPrevStory() {
  if (state.activeStoryItemIndex > 0) {
    state.activeStoryItemIndex--;
    renderActiveStory();
  } else {
    // Go to previous group
    if (state.activeStoryGroupIndex > 0) {
      state.activeStoryGroupIndex--;
      // Set to last item of previous group
      state.activeStoryItemIndex = state.storiesGroups[state.activeStoryGroupIndex].items.length - 1;
      renderActiveStory();
    } else {
      // At first story, restart it
      renderActiveStory();
    }
  }
}

function closeStoryViewer() {
  if (state.storyTimer) {
    clearTimeout(state.storyTimer);
    state.storyTimer = null;
  }
  storyViewerDialog.close();
}

// ----------------------------------------------------
// DIRECT MESSAGES (DMs) CONTROLLER
// ----------------------------------------------------
async function loadChats() {
  const container = document.getElementById("chatThreadsContainer");
  container.innerHTML = `
    <div class="loading-placeholder">
      <div class="spinner"></div>
    </div>
  `;
  
  try {
    const res = await fetch("/api/social/chats");
    const data = await res.json();
    
    if (res.ok) {
      container.innerHTML = "";
      if (data.chats.length === 0) {
        container.innerHTML = `<p class="subtitle" style="text-align:center; padding: 20px 0;">No creators found to chat with.</p>`;
        return;
      }
      
      data.chats.forEach(chat => {
        const item = document.createElement("div");
        item.className = "chat-thread-item";
        if (state.activeChatUserId === chat.id) {
          item.classList.add("active");
        }
        
        const avatar = chat.avatar_url || AVATAR_PRESETS[0];
        const timeText = chat.lastMessageTime ? formatRelativeTime(chat.lastMessageTime) : "";
        let preview = chat.lastMessage || "No messages yet.";
        if (chat.lastMessageSenderId === state.currentUser.id) {
          preview = `You: ${preview}`;
        }
        
        item.innerHTML = `
          <img class="avatar-img-sm" src="${avatar}" alt="${chat.name}">
          <div class="chat-thread-meta">
            <div class="chat-thread-header-row">
              <span class="chat-thread-name">${chat.name}</span>
              <span class="chat-thread-time">${timeText}</span>
            </div>
            <span class="chat-thread-preview">${preview}</span>
          </div>
        `;
        
        item.addEventListener("click", () => openChatWindow(chat));
        container.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

async function openChatWindow(chatUser) {
  state.activeChatUserId = chatUser.id;
  
  // Highlight active thread item
  document.querySelectorAll(".chat-thread-item").forEach(el => el.classList.remove("active"));
  // reload sidebar list to ensure active highlight class is re-applied correctly
  const threads = document.querySelectorAll(".chat-thread-item");
  threads.forEach(el => {
    if (el.querySelector(".chat-thread-name").textContent === chatUser.name) {
      el.classList.add("active");
    }
  });

  // Hydrate active chat header
  document.getElementById("chatHeaderAvatar").src = chatUser.avatar_url || AVATAR_PRESETS[0];
  document.getElementById("chatHeaderName").textContent = chatUser.name;
  document.getElementById("chatHeaderUsername").textContent = `@${chatUser.username}`;
  
  document.getElementById("chatWindowPlaceholder").classList.add("hidden");
  document.getElementById("activeChatThread").classList.remove("hidden");
  
  // Load messages
  await loadMessages(chatUser.id, true);
  
  // Start Polling for new messages
  if (state.chatPollInterval) {
    clearInterval(state.chatPollInterval);
  }
  
  state.chatPollInterval = setInterval(async () => {
    if (state.currentTab === "chats" && state.activeChatUserId === chatUser.id) {
      await loadMessages(chatUser.id, false);
    }
  }, 2500);
}

let lastMessageCount = 0;
async function loadMessages(userId, showSpinner) {
  const listContainer = document.getElementById("chatMessagesList");
  if (showSpinner) {
    listContainer.innerHTML = `
      <div class="loading-placeholder">
        <div class="spinner"></div>
      </div>
    `;
    lastMessageCount = 0;
  }
  
  try {
    const res = await fetch(`/api/social/chats/${userId}`);
    const data = await res.json();
    
    if (res.ok) {
      // Check if new messages arrived
      if (data.messages.length !== lastMessageCount) {
        listContainer.innerHTML = "";
        
        if (data.messages.length === 0) {
          listContainer.innerHTML = `<p class="subtitle" style="text-align:center; padding: 20px 0;">No messages yet. Say hello!</p>`;
          lastMessageCount = 0;
          return;
        }
        
        data.messages.forEach(msg => {
          const bubble = document.createElement("div");
          const isSent = msg.sender_id === state.currentUser.id;
          bubble.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
          bubble.textContent = msg.content;
          listContainer.appendChild(bubble);
        });
        
        // Scroll to bottom
        listContainer.scrollTop = listContainer.scrollHeight;
        lastMessageCount = data.messages.length;
        
        // Reload chats threads list to show updated snippets
        loadChats();
      }
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------------------------------------------
// IMAGE PRESET & STORY PRESET GENERATORS
// ----------------------------------------------------
function renderPresetImages() {
  const container = document.getElementById("presetsGrid");
  container.innerHTML = "";
  PHOTO_PRESETS.forEach(p => {
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = p.name;
    img.className = "preset-img-option";
    img.setAttribute("data-url", p.url);
    container.appendChild(img);
  });
}

function renderStoryPresets() {
  storyPresetsGrid.innerHTML = "";
  PHOTO_PRESETS.forEach(p => {
    const img = document.createElement("img");
    img.src = p.url;
    img.alt = p.name;
    img.className = "suggested-avatar-option story-preset-option";
    img.setAttribute("data-url", p.url);
    storyPresetsGrid.appendChild(img);
  });
}

// ----------------------------------------------------
// EXPLORE SCREEN LOADER (Instagram replica grid)
// ----------------------------------------------------
async function loadExplore() {
  exploreUsersGrid.innerHTML = `
    <div class="loading-placeholder" style="grid-column: 1 / -1;">
      <div class="spinner"></div>
      <p>Gathering visual feed...</p>
    </div>
  `;
  
  try {
    const res = await fetch("/api/social/posts?feed=global");
    const data = await res.json();
    
    if (res.ok) {
      exploreUsersGrid.innerHTML = "";
      
      // Filter out posts without images to make it visual focus
      const visualPosts = data.posts.filter(p => p.image_url);
      
      if (visualPosts.length === 0) {
        exploreUsersGrid.innerHTML = `
          <div class="loading-placeholder" style="grid-column: 1 / -1;">
            <p>No photos posted yet. Go create one!</p>
          </div>
        `;
        return;
      }
      
      // Filter by search query
      const query = searchUserInput.value.trim().toLowerCase();
      const filtered = visualPosts.filter(p => {
        return p.author.name.toLowerCase().includes(query) || 
               p.author.username.toLowerCase().includes(query) || 
               p.content.toLowerCase().includes(query);
      });
      
      if (filtered.length === 0) {
        exploreUsersGrid.innerHTML = `
          <div class="loading-placeholder" style="grid-column: 1 / -1;">
            <p>No photos match your search.</p>
          </div>
        `;
        return;
      }
      
      filtered.forEach(post => {
        const item = document.createElement("div");
        item.className = "explore-item";
        
        item.innerHTML = `
          <img class="${post.filter_style || ''}" src="${post.image_url}" alt="Explore visual">
          <div class="explore-overlay">
            <div class="explore-overlay-stat">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
              <span>${post.likesCount}</span>
            </div>
            <div class="explore-overlay-stat">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              <span>${post.commentsCount}</span>
            </div>
          </div>
        `;
        
        item.addEventListener("click", () => openPostDetail(post));
        exploreUsersGrid.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------------------------------------------
// PROFILE SCREEN LOADER (Instagram replica grid)
// ----------------------------------------------------
async function loadUserProfile(username) {
  state.activeProfileUsername = username;
  profilePostsContainer.innerHTML = `
    <div class="loading-placeholder" style="grid-column: 1 / -1;">
      <div class="spinner"></div>
      <p>Loading posts...</p>
    </div>
  `;
  
  try {
    const res = await fetch(`/api/social/users/${username}`);
    const data = await res.json();
    
    if (res.ok) {
      const u = data.user;
      
      document.getElementById("profileAvatar").src = u.avatar_url || AVATAR_PRESETS[0];
      document.getElementById("profileDisplayName").textContent = u.name;
      document.getElementById("profileUsername").textContent = `@${u.username}`;
      document.getElementById("profileBio").textContent = u.bio || "No bio yet.";
      
      document.getElementById("profilePostCount").textContent = u.postsCount;
      document.getElementById("profileFollowersCount").textContent = u.followersCount;
      document.getElementById("profileFollowingCount").textContent = u.followingCount;
      
      const actionsDiv = document.getElementById("profileActions");
      actionsDiv.innerHTML = "";
      
      if (u.id === state.currentUser.id) {
        const editBtn = document.createElement("button");
        editBtn.className = "btn btn-secondary btn-sm";
        editBtn.innerHTML = `Edit Profile`;
        editBtn.addEventListener("click", () => {
          editDisplayNameInput.value = u.name;
          editBioInput.value = u.bio;
          editAvatarInput.value = u.avatar_url;
          editProfileDialog.showModal();
        });
        actionsDiv.appendChild(editBtn);
      } else {
        const followBtn = document.createElement("button");
        const isFollowing = u.isFollowing;
        followBtn.className = `btn btn-sm ${isFollowing ? "btn-secondary" : "btn-primary"}`;
        followBtn.textContent = isFollowing ? "Following" : "Follow";
        followBtn.addEventListener("click", async () => {
          const success = await handleFollowToggle(u.id, followBtn, true, isFollowing);
          if (success) {
            loadUserProfile(username);
          }
        });
        actionsDiv.appendChild(followBtn);
      }
      
      // Render Posts Grid
      profilePostsContainer.innerHTML = "";
      if (data.posts.length === 0) {
        profilePostsContainer.innerHTML = `
          <div class="loading-placeholder" style="grid-column: 1 / -1;">
            <p>This user hasn't posted anything yet.</p>
          </div>
        `;
        return;
      }
      
      data.posts.forEach(post => {
        post.author = {
          id: u.id,
          name: u.name,
          username: u.username,
          avatar_url: u.avatar_url
        };
        
        const item = document.createElement("div");
        item.className = "profile-grid-item";
        
        const filter = post.filter_style || "";
        const imageSrc = post.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"; // fallback if text-only post
        
        item.innerHTML = `
          <img class="${filter}" src="${imageSrc}" alt="Grid item">
        `;
        
        item.addEventListener("click", () => openPostDetail(post));
        profilePostsContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------------------------------------------
// DETAIL DIALOG OVERLAY (Instagram style)
// ----------------------------------------------------
async function openPostDetail(post) {
  const avatar = post.author.avatar_url || AVATAR_PRESETS[0];
  const imageSrc = post.image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80";
  
  detailPostImg.src = imageSrc;
  detailPostImg.className = post.filter_style || "";
  
  detailAuthorAvatar.src = avatar;
  detailAuthorName.textContent = post.author.name;
  detailAuthorUsername.textContent = `@${post.author.username}`;
  detailPostContent.innerHTML = `<strong>@${post.author.username}</strong> ${escapeHTML(post.content)}`;
  detailPostTime.textContent = formatRelativeTime(post.created_at);
  detailLikesCount.textContent = post.likesCount;
  
  detailCommentForm.setAttribute("data-post-id", post.id);
  
  // Likes trigger state
  const likeBtn = postDetailDialog.querySelector(".detail-like-btn");
  likeBtn.className = "post-action-btn detail-like-btn";
  if (post.hasLiked) {
    likeBtn.classList.add("liked");
  }
  
  // Remove event listener duplicates by replacing button clone
  const newLikeBtn = likeBtn.cloneNode(true);
  likeBtn.parentNode.replaceChild(newLikeBtn, likeBtn);
  newLikeBtn.addEventListener("click", async () => {
    const isLiked = newLikeBtn.classList.contains("liked");
    const endpoint = `/api/social/posts/${post.id}/${isLiked ? 'unlike' : 'like'}`;
    
    let count = parseInt(detailLikesCount.textContent, 10);
    if (isLiked) {
      newLikeBtn.classList.remove("liked");
      detailLikesCount.textContent = Math.max(0, count - 1);
    } else {
      newLikeBtn.classList.add("liked");
      detailLikesCount.textContent = count + 1;
    }
    
    await fetch(endpoint, { method: "POST" });
    if (state.currentTab === "feed") loadFeed();
  });
  
  // Show delete button if owner
  if (post.author.id === state.currentUser.id) {
    detailDeleteBtn.classList.remove("hidden");
    const newDeleteBtn = detailDeleteBtn.cloneNode(true);
    detailDeleteBtn.parentNode.replaceChild(newDeleteBtn, detailDeleteBtn);
    newDeleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this post? This cannot be undone.")) {
        const success = await handleDeletePost(post.id);
        if (success) {
          postDetailDialog.close();
          if (state.currentTab === "feed") loadFeed();
          else if (state.currentTab === "profile") loadUserProfile(state.currentUser.username);
          else if (state.currentTab === "explore") loadExplore();
        }
      }
    });
  } else {
    detailDeleteBtn.classList.add("hidden");
  }
  
  // Load comments
  await loadComments(post.id, detailCommentsList);
  
  postDetailDialog.showModal();
}

// ----------------------------------------------------
// HOME FEED LOADER (Instagram replica cards list)
// ----------------------------------------------------
async function loadFeed() {
  postsFeedContainer.innerHTML = `
    <div class="loading-placeholder">
      <div class="spinner"></div>
      <p>Gathering fresh posts...</p>
    </div>
  `;
  
  try {
    const res = await fetch(`/api/social/posts?feed=${state.feedFilter}`);
    const data = await res.json();
    
    if (res.ok) {
      postsFeedContainer.innerHTML = "";
      if (data.posts.length === 0) {
        postsFeedContainer.innerHTML = `
          <div class="loading-placeholder">
            <p>No posts in feed yet. Follow some creators or post something!</p>
          </div>
        `;
        return;
      }
      
      data.posts.forEach(post => {
        const card = renderPostItem(post);
        postsFeedContainer.appendChild(card);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// Render single Instagram visual post card
function renderPostItem(post) {
  const card = document.createElement("article");
  card.className = "card post-card";
  
  const avatar = post.author.avatar_url || AVATAR_PRESETS[0];
  const relativeTime = formatRelativeTime(post.created_at);
  const filter = post.filter_style || "";
  
  const imageMarkup = post.image_url ? `
    <div class="post-card-img-wrapper">
      <img class="${filter}" src="${post.image_url}" alt="Post image">
      <!-- Large overlay double tap heart -->
      <svg class="double-tap-heart" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </div>
  ` : "";
  
  const likedClass = post.hasLiked ? "liked" : "";
  const isOwner = post.author.id === state.currentUser.id;
  const deleteBtn = isOwner ? `
    <button class="post-action-btn btn-delete-post" title="Delete Post">
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
    </button>
  ` : "";
  
  card.innerHTML = `
    <div class="card-body" style="padding: 12px 16px 10px 16px;">
      <div class="post-header" style="margin-bottom:10px;">
        <div class="post-author">
          <img class="avatar-img-sm" src="${avatar}" alt="${post.author.name}">
          <div class="post-author-meta">
            <span class="post-author-name">${post.author.name}</span>
            <span class="username-text">@${post.author.username} • <span class="post-time">${relativeTime}</span></span>
          </div>
        </div>
        ${deleteBtn}
      </div>
    </div>
    
    ${imageMarkup}
    
    <div class="card-body" style="padding: 10px 16px 16px 16px;">
      <div class="post-actions-row" style="border:none; padding: 0 0 8px 0; margin:0;">
        <button class="post-action-btn like-btn ${likedClass}">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
          <span class="likes-count">${post.likesCount}</span>
        </button>
        <button class="post-action-btn comment-trigger-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
          <span>${post.commentsCount}</span>
        </button>
      </div>
      
      <div class="post-content" style="margin: 0; padding: 0 0 10px 0; font-size: 0.9rem;">
        <strong>@${post.author.username}</strong> ${escapeHTML(post.content)}
      </div>
      
      <!-- Collapsible Comments Area -->
      <div class="post-comments-section hidden" style="border-top: 1px solid var(--border-color); margin: 0; padding-top: 10px;">
        <div class="comments-list">
          <div class="loading-placeholder" style="padding: 10px;">
            <div class="spinner" style="width:16px; height:16px; border-width:2px;"></div>
          </div>
        </div>
        <form class="comment-form">
          <input type="text" placeholder="Add a comment..." required>
          <button type="submit" class="btn btn-primary btn-sm">Post</button>
        </form>
      </div>
    </div>
  `;

  // Profile Click navigate
  card.querySelector(".post-author").addEventListener("click", () => navigate("profile", post.author.username));

  // Like Click Event
  const likeBtn = card.querySelector(".like-btn");
  const countSpan = card.querySelector(".likes-count");
  likeBtn.addEventListener("click", () => handleLikeToggle(post.id, likeBtn, countSpan));

  // Double-tap to Like Gesture
  const imgWrapper = card.querySelector(".post-card-img-wrapper");
  if (imgWrapper) {
    let lastTap = 0;
    imgWrapper.addEventListener("click", (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 300 && tapLength > 0) {
        // Trigger double tap heart animation
        const heart = imgWrapper.querySelector(".double-tap-heart");
        heart.classList.remove("animate");
        void heart.offsetWidth; // trigger reflow
        heart.classList.add("animate");
        
        // Trigger Like
        if (!likeBtn.classList.contains("liked")) {
          handleLikeToggle(post.id, likeBtn, countSpan);
        }
      }
      lastTap = currentTime;
    });
  }

  // Comments drawer trigger
  const commentTrigger = card.querySelector(".comment-trigger-btn");
  const commentsSection = card.querySelector(".post-comments-section");
  const commentsList = card.querySelector(".comments-list");
  const commentForm = card.querySelector(".comment-form");

  commentTrigger.addEventListener("click", () => {
    const isHidden = commentsSection.classList.toggle("hidden");
    if (!isHidden) {
      loadComments(post.id, commentsList);
    }
  });

  commentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = commentForm.querySelector("input");
    const content = input.value.trim();
    if (!content) return;
    
    await submitComment(post.id, content, input, commentsList, commentTrigger);
  });

  // Delete Click Event
  if (isOwner) {
    card.querySelector(".btn-delete-post").addEventListener("click", async () => {
      if (confirm("Delete this post?")) {
        const success = await handleDeletePost(post.id);
        if (success) card.remove();
      }
    });
  }

  return card;
}

// ----------------------------------------------------
// GENERAL API HELPERS
// ----------------------------------------------------
async function handleLikeToggle(postId, btn, countSpan) {
  const isLiked = btn.classList.contains("liked");
  const endpoint = `/api/social/posts/${postId}/${isLiked ? 'unlike' : 'like'}`;
  
  let count = parseInt(countSpan.textContent, 10);
  if (isLiked) {
    btn.classList.remove("liked");
    countSpan.textContent = Math.max(0, count - 1);
  } else {
    btn.classList.add("liked");
    countSpan.textContent = count + 1;
  }
  
  try {
    const res = await fetch(endpoint, { method: "POST" });
    if (!res.ok) {
      btn.classList.toggle("liked");
      countSpan.textContent = count;
    }
  } catch (err) {
    console.error(err);
  }
}

async function handleFollowToggle(userId, btn, isProfileView, currentFollowing) {
  const endpoint = `/api/social/users/${userId}/${currentFollowing ? 'unfollow' : 'follow'}`;
  try {
    const res = await fetch(endpoint, { method: "POST" });
    if (res.ok) {
      const nowFollowing = !currentFollowing;
      btn.className = `btn btn-sm ${nowFollowing ? "btn-secondary" : "btn-primary"}`;
      btn.textContent = nowFollowing ? "Following" : "Follow";
      loadRightSidebarSuggestions();
      return true;
    }
    return false;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function handleDeletePost(postId) {
  try {
    const res = await fetch(`/api/social/posts/${postId}`, { method: "DELETE" });
    return res.ok;
  } catch (err) {
    console.error(err);
    return false;
  }
}

async function loadComments(postId, container) {
  try {
    const res = await fetch(`/api/social/posts/${postId}/comments`);
    const data = await res.json();
    
    if (res.ok) {
      container.innerHTML = "";
      if (data.comments.length === 0) {
        container.innerHTML = `<p class="comment-text" style="color:var(--text-muted); text-align:center; padding: 6px 0; font-size:0.8rem;">No comments yet.</p>`;
        return;
      }
      data.comments.forEach(comment => {
        const item = document.createElement("div");
        item.className = "comment-item";
        const avatar = comment.author.avatar_url || AVATAR_PRESETS[0];
        const relativeTime = formatRelativeTime(comment.created_at);
        
        item.innerHTML = `
          <img class="comment-author-avatar" src="${avatar}" alt="${comment.author.name}">
          <div class="comment-body">
            <div class="comment-header">
              <span class="comment-author-name">${comment.author.name}</span>
              <span class="comment-time">${relativeTime}</span>
            </div>
            <p class="comment-text">${escapeHTML(comment.content)}</p>
          </div>
        `;
        
        item.querySelector(".comment-author-avatar").addEventListener("click", () => {
          postDetailDialog.close();
          navigate("profile", comment.author.username);
        });
        item.querySelector(".comment-author-name").addEventListener("click", () => {
          postDetailDialog.close();
          navigate("profile", comment.author.username);
        });
        
        container.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

async function submitComment(postId, content, inputField, container, triggerBtn) {
  try {
    const res = await fetch(`/api/social/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content })
    });
    
    if (res.ok) {
      inputField.value = "";
      const countSpan = triggerBtn.querySelector("span");
      countSpan.textContent = parseInt(countSpan.textContent, 10) + 1;
      await loadComments(postId, container);
    }
  } catch (err) {
    console.error(err);
  }
}

// Creators to follow suggestion lists load
async function loadRightSidebarSuggestions() {
  try {
    const res = await fetch("/api/social/users");
    const data = await res.json();
    
    if (res.ok) {
      rightSuggestionsContainer.innerHTML = "";
      const unfolowed = data.users.filter(u => !u.isFollowing).slice(0, 4);
      
      if (unfolowed.length === 0) {
        rightSuggestionsContainer.innerHTML = `<p class="subtitle" style="text-align:center; padding: 12px 0;">You're following everyone!</p>`;
        return;
      }
      
      unfolowed.forEach(user => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        
        item.innerHTML = `
          <div class="post-author" style="gap:8px;">
            <img class="avatar-img-sm" src="${user.avatar_url || AVATAR_PRESETS[0]}" alt="${user.name}" style="width:32px; height:32px;">
            <div class="post-author-meta">
              <span class="display-name-text" style="font-size:0.8rem; line-height:1.2;">${user.name}</span>
              <span class="username-text" style="font-size:0.7rem; line-height:1.2;">@${user.username}</span>
            </div>
          </div>
          <button class="btn btn-sm btn-primary follow-suggest-btn" style="padding: 4px 10px; font-size:0.7rem; border-radius:6px;">Follow</button>
        `;
        
        item.querySelector(".post-author").addEventListener("click", () => navigate("profile", user.username));
        
        const followBtn = item.querySelector(".follow-suggest-btn");
        followBtn.addEventListener("click", async () => {
          const success = await handleFollowToggle(user.id, followBtn, false, false);
          if (success) {
            item.remove();
            if (state.currentTab === "feed") loadFeed();
          }
        });
        
        rightSuggestionsContainer.appendChild(item);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ----------------------------------------------------
// UTILITY HELPERS
// ----------------------------------------------------
function renderAvatarOptions(container, inputField) {
  container.innerHTML = "";
  AVATAR_PRESETS.forEach((preset, index) => {
    const img = document.createElement("img");
    img.src = preset;
    img.className = "suggested-avatar-option";
    img.addEventListener("click", () => {
      container.querySelectorAll(".suggested-avatar-option").forEach(el => el.classList.remove("selected"));
      img.classList.add("selected");
      state.selectedAvatarUrl = preset;
      inputField.value = preset;
    });
    container.appendChild(img);
  });
}

function formatRelativeTime(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  
  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
