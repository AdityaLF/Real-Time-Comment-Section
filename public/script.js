let database; // Declare database globally to be accessible after initialization.

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // --- 1. INITIALIZATION & CONFIGURATION ---

        // Firebase configuration object. Replace with your actual Firebase project details.
        const firebaseConfig = {
            apiKey: "__API_KEY__",
            authDomain: "__AUTH_DOMAIN__",
            databaseURL: "__DATABASE_URL__",
            projectId: "__PROJECT_ID__",
            storageBucket: "__STORAGE_BUCKET__",
            messagingSenderId: "__MESSAGING_SENDER_ID__",
            appId: "__APP_ID__",
            measurementId: "__MEASUREMENT_ID__"
        };

        // Owner information for special display.
        const ownerInfo = {
            secretName: "__SPECIAL_USERNAME__",
            displayName: "__OWNER_DISPLAY_NAME__"
        };

        // Initialize Firebase.
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();

        // --- 2. GLOBAL VARIABLES & CONSTANTS ---

        // -- DOM Element References --
        const usernameInput = document.getElementById('usernameInput');
        const commentText = document.getElementById('commentText');
        const postCommentBtn = document.getElementById('postCommentBtn');
        const commentsContainer = document.getElementById('commentsContainer');
        const postViewCountSpan = document.querySelector('.post-actions .view-count');
        const mainCharCount = document.getElementById('mainCharCount');
        const typingTextElement = document.getElementById('typing-text');

        // -- Firebase Database References --
        const commentsRef = database.ref('comments');
        const postId = 'example_post_id'; // Unique ID for this specific post.
        const postViewsRef = database.ref(`post_views/${postId}`);

        // -- Session State --
        const viewedItemIdsInSession = new Set();

        // -- SVG Icons --
        const viewIconSVG = '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>';
        const replyIconSVG = '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 18v-2a4 4 0 0 0-4-4H4"/><path d="m9 17-5-5 5-5"/></svg>';
        const chevronDownSVG = '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
        const chevronUpSVG = '<svg class="lucide-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></path></svg>';
        const verifiedIconSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(255, 176, 7)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-badge-check-icon lucide-badge-check"><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/><path d="m9 12 2 2 4-4"/></svg>';

        // --- 3. HELPER & UTILITY FUNCTIONS ---

        /** Gets the display name for a user, checking if it's the owner. */
        function getDisplayName(username) {
            if (ownerInfo && username === ownerInfo.secretName) {
                return ownerInfo.displayName;
            }
            return username;
        }

        /** Updates a character counter element based on textarea input. */
        function updateCharCounter(textareaElement, counterElement) {
            const currentLength = textareaElement.value.length;
            const maxLength = textareaElement.maxLength;
            counterElement.textContent = `${currentLength}`;
            counterElement.parentElement.style.color = currentLength >= maxLength ? 'red' : '';
        }

        /** Validates a username against a regex. */
        function isValidUsername(username) {
            const regex = /^[a-zA-Z0-9\s.]{1,20}$/;
            return regex.test(username);
        }

        /** Validates comment text against a regex. */
        function isValidCommentText(text) {
            const regex = /^[a-zA-Z0-9\s.,'?!()\[\]{}"~:;^|<>@#$%&*_+\-=\/]+$/;
            return regex.test(text);
        }

        /** Formats an ISO timestamp into a readable date-time string. */
        const formatTimestamp = (iso) => new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        
        /** Formats reply text to highlight mentions. */
        const formatReplyText = (text) => text.replace(/^@([\w.]+)\s/, '<span class="mention-username">@$1</span> ');

        /** Handles submission logic with a cooldown period to prevent spam. */
        function handlePostSubmission(postLogic) {

        const cooldownDuration = 86400000;

        const lastPostTime = localStorage.getItem('lastPostTime');
        if (lastPostTime) {
            const timePassed = Date.now() - parseInt(lastPostTime, 10);

            if (timePassed < cooldownDuration) {
                // 2. Calculate remaining time in a user-friendly format (hours and minutes)
                const remainingMillis = cooldownDuration - timePassed;
                
                const hours = Math.floor(remainingMillis / 3600000); //
                const minutes = Math.ceil((remainingMillis % 3600000) / 60000); 

                let timeLeftMessage = "";
                if (hours > 0) {
                    timeLeftMessage += `${hours} hour `;
                }
                if (minutes > 0 || hours === 0) {
                    timeLeftMessage += `${minutes} minute`;
                }

                alert(`You can post again in ${timeLeftMessage.trim()}.`);
                return;
            }
        }
        
        // Execute the specific post logic (for comments or replies).
        const postSuccessful = postLogic();
        if (postSuccessful) {
            localStorage.setItem('lastPostTime', Date.now().toString());
        }
    }

        /** Increments the view count for an item (post or comment) in Firebase. */
        function incrementItemViews(path, id) {
            const key = `viewed_${id}`;
            // Prevent incrementing if viewed in this session or a past session (localStorage).
            if (localStorage.getItem(key) || viewedItemIdsInSession.has(key)) return;
            
            viewedItemIdsInSession.add(key);
            database.ref(path).transaction(currentViews => (currentViews || 0) + 1).then(() => {
                localStorage.setItem(key, 'true'); // Mark as viewed for future sessions.
            });
        }

        // --- 4. CORE RENDERING FUNCTIONS ---

        /** Creates and configures the HTML element for a single top-level comment. */
        function createCommentElement(comment) {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.dataset.id = comment.id;
            commentDiv.dataset.username = comment.username;

            const displayUsername = getDisplayName(comment.username);
            const finalUsername = (ownerInfo && comment.username === ownerInfo.secretName)
                ? `${displayUsername} ${verifiedIconSVG}`
                : displayUsername;

            commentDiv.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${finalUsername}</span>
                    <span class="comment-time">${formatTimestamp(comment.timestamp)}</span>
                </div>
                <div class="comment-text">${comment.text}</div>
                <div class="comment-actions">
                    <span class="reply-btn">${replyIconSVG} Reply</span>
                    <span class="view-count">${viewIconSVG} ${comment.views || 0} Views</span>
                </div>
                <div class="reply-input-section hidden">
                    <input type="text" class="reply-username-input" placeholder="Your Name" maxlength="20">
                    <textarea class="reply-text-input" placeholder="Write a reply..." rows="2" maxlength="300"></textarea>
                    <div class="char-counter"><span class="reply-char-count">0</span> / 300</div>
                    <button class="post-reply-btn">Reply</button>
                </div>
                <div class="replies"></div>
                <div class="replies-toggle-container"></div>
            `;

            incrementItemViews(`comments/${comment.id}/views`, `comment_${comment.id}`);

            // --- Element-specific event listeners ---
            const replyInputSection = commentDiv.querySelector('.reply-input-section');
            const replyTextarea = replyInputSection.querySelector('.reply-text-input');
            const replyCharCount = replyInputSection.querySelector('.reply-char-count');

            replyTextarea.addEventListener('input', () => updateCharCounter(replyTextarea, replyCharCount));

            commentDiv.querySelector('.reply-btn').addEventListener('click', () => {
                const isHidden = replyInputSection.classList.contains('hidden');
                document.querySelectorAll('.reply-input-section').forEach(form => form.classList.add('hidden'));
                if (isHidden) {
                    replyInputSection.classList.remove('hidden');
                    // No @mention for direct replies to top-level comments.
                    replyInputSection.querySelector('.reply-text-input').value = ''; 
                    updateCharCounter(replyTextarea, replyCharCount);
                    replyInputSection.querySelector('.reply-username-input').focus();
                }
            });

            commentDiv.querySelector('.post-reply-btn').addEventListener('click', () => {
                handlePostSubmission(() => {
                    const username = replyInputSection.querySelector('.reply-username-input').value.trim();
                    const text = replyInputSection.querySelector('.reply-text-input').value.trim();
                    
                    if (!text) { alert('Reply text cannot be empty.'); return false; }
                    if (!isValidUsername(username)) { alert('Username must be 1-20 characters and can contain letters, numbers, spaces, and periods.'); return false; }
                    if (!isValidCommentText(text)) { alert('Your reply contains disallowed characters.'); return false; }

                    const newReply = { username, text, timestamp: new Date().toISOString(), views: 0 };
                    database.ref(`comments/${comment.id}/replies`).push(newReply).then(() => {
                        replyInputSection.classList.add('hidden');
                    });
                    return true;
                });
            });

            return commentDiv;
        }

        /** Creates and appends the HTML element for a nested reply. */
        function appendReplyElement(parentElement, reply, level, currentPath) {
            const replyDiv = document.createElement('div');
            replyDiv.className = `reply-comment reply-level-${level}`;
            replyDiv.dataset.id = reply.id;
            replyDiv.dataset.path = currentPath;
            replyDiv.dataset.username = reply.username;
            
            const displayUsername = getDisplayName(reply.username);
            const finalUsername = (ownerInfo && reply.username === ownerInfo.secretName)
                ? `${displayUsername} ${verifiedIconSVG}`
                : displayUsername;

            replyDiv.innerHTML = `
                <div class="comment-header">
                    <span class="comment-username">${finalUsername}</span>
                    <span class="comment-time">${formatTimestamp(reply.timestamp)}</span>
                </div>
                <div class="comment-text">${formatReplyText(reply.text)}</div>
                <div class="comment-actions">
                    <span class="reply-btn">${replyIconSVG} Reply</span>
                    <span class="view-count">${viewIconSVG} ${reply.views || 0} Views</span>
                </div>
                <div class="reply-input-section hidden">
                    <input type="text" class="reply-username-input" placeholder="Your Name" maxlength="20">
                    <textarea class="reply-text-input" placeholder="Write a reply..." rows="2" maxlength="300"></textarea>
                    <div class="char-counter"><span class="reply-char-count">0</span> / 300</div>
                    <button class="post-reply-btn">Reply</button>
                </div>
            `;

            // Append the new reply element to its parent container.
            parentElement.appendChild(replyDiv);
            
            incrementItemViews(`${currentPath}/views`, `reply_${reply.id}`);

            // --- Element-specific event listeners ---
            const replyInputSection = replyDiv.querySelector('.reply-input-section');
            const replyTextarea = replyInputSection.querySelector('.reply-text-input');
            const replyCharCount = replyInputSection.querySelector('.reply-char-count');
            
            replyTextarea.addEventListener('input', () => updateCharCounter(replyTextarea, replyCharCount));

            replyDiv.querySelector('.reply-btn').addEventListener('click', () => {
                const isHidden = replyInputSection.classList.contains('hidden');
                document.querySelectorAll('.reply-input-section').forEach(form => form.classList.add('hidden'));
                if (isHidden) {
                    replyInputSection.classList.remove('hidden');
                    // Automatically @mention the user being replied to.
                    replyInputSection.querySelector('.reply-text-input').value = `@${displayUsername} `;
                    updateCharCounter(replyTextarea, replyCharCount);
                    replyInputSection.querySelector('.reply-username-input').focus();
                }
            });

            replyDiv.querySelector('.post-reply-btn').addEventListener('click', () => {
                handlePostSubmission(() => {
                    const username = replyInputSection.querySelector('.reply-username-input').value.trim();
                    const text = replyInputSection.querySelector('.reply-text-input').value.trim();
                    
                    if (!text) { alert('Reply text cannot be empty.'); return false; }
                    if (!isValidUsername(username)) { alert('Username must be 1-20 characters and can contain letters, numbers, spaces, and periods.'); return false; }
                    if (!isValidCommentText(text)) { alert('Your reply contains disallowed characters.'); return false; }

                    const newReply = { username, text, timestamp: new Date().toISOString(), views: 0 };
                    // Post the new reply nested under the correct path.
                    database.ref(`${currentPath}/replies`).push(newReply).then(() => {
                        replyInputSection.classList.add('hidden');
                    });
                    return true;
                });
            });

            return replyDiv;
        }

        /** Renders all replies for a given comment, handling nesting and "show more" logic. */
        function displayReplies(commentElement, repliesData) {
            const MAX_VISIBLE_REPLIES = 1;
            const repliesContainer = commentElement.querySelector('.replies');
            const toggleContainer = commentElement.querySelector('.replies-toggle-container');

            let flatReplies = [];
            const flattenReplies = (repliesObj, level, parentPath) => {
                if (!repliesObj) return;
                // Sort replies by timestamp before processing.
                const sorted = Object.keys(repliesObj).map(key => ({
                    id: key, ...repliesObj[key]
                })).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                sorted.forEach(reply => {
                    flatReplies.push({ ...reply, level: level, path: `${parentPath}/${reply.id}` });
                    if (reply.replies) {
                        // Recursively flatten nested replies.
                        flattenReplies(reply.replies, level + 1, `${parentPath}/${reply.id}/replies`);
                    }
                });
            };

            const initialPath = `comments/${commentElement.dataset.id}/replies`;
            flattenReplies(repliesData, 1, initialPath);

            // Clear existing replies and toggle button before re-rendering.
            repliesContainer.innerHTML = '';
            toggleContainer.innerHTML = '';

            if (flatReplies.length === 0) return;

            const isExpanded = repliesContainer.dataset.isExpanded === 'true';
            const repliesToRender = isExpanded ? flatReplies : flatReplies.slice(0, MAX_VISIBLE_REPLIES);

            repliesToRender.forEach(reply => {
                appendReplyElement(repliesContainer, reply, reply.level, reply.path);
            });

            const hiddenCount = flatReplies.length - repliesToRender.length;

            if (!isExpanded && hiddenCount > 0) {
                toggleContainer.innerHTML = `<button class="show-more-replies-btn">Show ${hiddenCount} more replies ${chevronDownSVG}</button>`;
                toggleContainer.querySelector('.show-more-replies-btn').addEventListener('click', () => {
                    repliesContainer.dataset.isExpanded = 'true';
                    displayReplies(commentElement, repliesData); // Re-render in expanded state.
                });
            } else if (isExpanded && flatReplies.length > MAX_VISIBLE_REPLIES) {
                toggleContainer.innerHTML = `<button class="show-more-replies-btn">Show less ${chevronUpSVG}</button>`;
                toggleContainer.querySelector('.show-more-replies-btn').addEventListener('click', () => {
                    repliesContainer.dataset.isExpanded = 'false';
                    displayReplies(commentElement, repliesData); // Re-render in collapsed state.
                });
            }
        }
        
        // --- 5. UI ANIMATIONS & INITIALIZATION ---

        /** Initializes and controls the typing animation effect. */
        function initializeTypingAnimation() {
            if (!typingTextElement) return; // Exit if the element doesn't exist.

            // Configuration
            const baseText = "This is a live demonstration of a real-time comment system, designed for live interaction.";
            const dynamicText = " Leave a comment...";
            const typingSpeed = 30;
            const erasingSpeed = 25;
            const pauseDuration = 7000; // 7-second pause.

            // State variables
            let baseIndex = 0;
            let dynamicIndex = 0;
            let isDeleting = false;

            // Types the initial, static part of the text.
            function typeInitialText() {
                if (baseIndex < baseText.length) {
                    typingTextElement.classList.remove('blinking-cursor');
                    typingTextElement.textContent = baseText.substring(0, baseIndex + 1);
                    baseIndex++;
                    setTimeout(typeInitialText, typingSpeed);
                } else {
                    // Finished typing base text, pause and then start the dynamic loop.
                    typingTextElement.classList.add('blinking-cursor');
                    setTimeout(typeEraseLoop, pauseDuration);
                }
            }
            
            // Loops the typing and erasing of the dynamic part of the text.
            function typeEraseLoop() {
                typingTextElement.classList.remove('blinking-cursor');
                
                isDeleting ? dynamicIndex-- : dynamicIndex++;
                typingTextElement.textContent = baseText + dynamicText.substring(0, dynamicIndex);

                if (!isDeleting && dynamicIndex === dynamicText.length) {
                    // Finished typing, start pause before deleting.
                    isDeleting = true;
                    typingTextElement.classList.add('blinking-cursor');
                    setTimeout(typeEraseLoop, pauseDuration);
                } else if (isDeleting && dynamicIndex === 0) {
                    // Finished deleting, start pause before re-typing.
                    isDeleting = false;
                    typingTextElement.classList.add('blinking-cursor');
                    setTimeout(typeEraseLoop, pauseDuration);
                } else {
                    // Continue to the next character.
                    setTimeout(typeEraseLoop, isDeleting ? erasingSpeed : typingSpeed);
                }
            }

            // Start the animation.
            typeInitialText();
        }

        // --- 6. EVENT LISTENERS & HANDLERS ---
        
        // Listener for the main comment submission button.
        postCommentBtn.addEventListener('click', () => {
            handlePostSubmission(() => {
                const username = usernameInput.value.trim();
                const text = commentText.value.trim();
                
                if (!text) { alert('Comment text cannot be empty.'); return false; }
                if (!isValidUsername(username)) { alert('Username must be 1-20 characters and can contain letters, numbers, spaces, and periods.'); return false; }
                if (!isValidCommentText(text)) { alert('Your comment contains disallowed characters.'); return false; }
                
                const newComment = { username, text, timestamp: new Date().toISOString(), views: 0 };
                commentsRef.push(newComment);

                // Clear input fields after successful submission.
                usernameInput.value = '';
                commentText.value = '';
                updateCharCounter(commentText, mainCharCount);
                return true;
            });
        });

        // Listener for the main comment textarea to update the character counter.
        commentText.addEventListener('input', () => {
            if (mainCharCount) {
                updateCharCounter(commentText, mainCharCount);
            }
        });

        // --- 7. FIREBASE REALTIME LISTENERS ---

        // Listens for new comments being added.
        commentsRef.orderByChild('timestamp').on('child_added', (snapshot) => {
            const commentId = snapshot.key;
            // Prevent re-rendering if the element already exists.
            if (document.querySelector(`[data-id="${commentId}"]`)) return;

            const commentElement = createCommentElement({ id: commentId, ...snapshot.val() });
            commentsContainer.prepend(commentElement); // Add new comments to the top.

            // Attach listeners to this specific new comment for updates.
            const thisCommentRef = database.ref(`comments/${commentId}`);
            
            thisCommentRef.on('child_changed', (childSnapshot) => {
                const field = childSnapshot.key;
                const value = childSnapshot.val();
                const el = document.querySelector(`[data-id="${commentId}"]`);
                if (!el) return;

                if (field === 'views') {
                    el.querySelector('.view-count').innerHTML = `${viewIconSVG} ${value} Views`;
                }
            });

            // Listen for new or changed replies under this comment.
            thisCommentRef.child('replies').on('value', (repliesSnapshot) => {
                const el = document.querySelector(`[data-id="${commentId}"]`);
                if (el) {
                    displayReplies(el, repliesSnapshot.val());
                }
            });
        });

        // Listens for comments being removed.
        commentsRef.on('child_removed', (snapshot) => {
            const commentId = snapshot.key;
            const el = document.querySelector(`[data-id="${commentId}"]`);
            if (el) {
                database.ref(`comments/${commentId}`).off(); // Detach all listeners for this comment.
                el.remove(); // Remove from the DOM.
            }
        });
        
        // Listens for changes to the total post view count.
        postViewsRef.on('value', snap => {
            postViewCountSpan.innerHTML = `${viewIconSVG} ${snap.val() || 0} Views`;
        });
        
        // --- 8. INITIAL FUNCTION CALLS ---
        
        incrementItemViews(`post_views/${postId}`, `post_${postId}`);
        initializeTypingAnimation();

    } catch (error) {
        // --- ERROR HANDLING ---
        console.error("Error initializing application:", error);
        alert("Failed to load application. Please try again later.");
    }
});
