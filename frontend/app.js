document.addEventListener('DOMContentLoaded', () => {
    // === UI Elements ===
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatHistory = document.getElementById('chat-history');
    
    const statsBody = document.getElementById('stats-body');
    const rebuildBtn = document.getElementById('rebuild-btn');
    const rebuildStatus = document.getElementById('rebuild-status');

    const uploadForm = document.getElementById("upload-form");
    const uploadStatus = document.getElementById("upload-status");
    const uploadSubmit = document.getElementById("upload-submit");

    // === Demo Mode Detection ===
    // Demo mode activates when the backend is unreachable (static hosting).
    // In demo mode, all queries are served from DEMO_CACHE (demo_cache.js).
    let isDemoMode = false;

    const activateDemoMode = () => {
        isDemoMode = true;

        // Show demo banner
        const demoBanner = document.getElementById('demo-banner');
        if (demoBanner) demoBanner.classList.remove('hidden');

        // Update status indicator
        const statusIndicator = document.getElementById('status-indicator');
        if (statusIndicator) {
            statusIndicator.textContent = '[DEMO]';
            statusIndicator.style.color = 'var(--text-dim)';
        }

        // Disable upload and rebuild controls
        const uploadCard = document.getElementById('upload-card');
        if (uploadCard) uploadCard.classList.add('demo-disabled');
        if (rebuildBtn) {
            rebuildBtn.disabled = true;
            rebuildBtn.classList.add('demo-disabled');
        }

        // Populate sample query cards in the hero section
        const sampleQueriesContainer = document.getElementById('sample-queries');
        if (sampleQueriesContainer && typeof DEMO_SAMPLE_QUESTIONS !== 'undefined') {
            const label = document.createElement('div');
            label.className = 'sample-queries-label';
            label.textContent = 'SAMPLE QUERIES';
            sampleQueriesContainer.appendChild(label);

            DEMO_SAMPLE_QUESTIONS.forEach(q => {
                const card = document.createElement('div');
                card.className = 'sample-query-card';
                
                const textSpan = document.createElement('span');
                textSpan.textContent = q;
                card.appendChild(textSpan);
                
                card.addEventListener('click', () => {
                    userInput.value = q;
                    const sendBtn = document.getElementById('send-button');
                    if (sendBtn) {
                        sendBtn.click();
                    } else {
                        chatForm.requestSubmit(); // modern standard fallback
                    }
                });
                sampleQueriesContainer.appendChild(card);
            });
            sampleQueriesContainer.classList.remove('hidden');
        }

        // Update hero subtitle
        const heroSubtitle = document.getElementById('hero-subtitle');
        if (heroSubtitle) {
            heroSubtitle.textContent = 'DEMO MODE. SELECT A PRE-CACHED QUERY BELOW TO SEE THE FULL RAG PIPELINE OUTPUT.';
        }

        // Update input placeholder
        if (userInput) {
            userInput.placeholder = '> Select a sample query above, or type one to see it matched...';
        }

        // Populate corpus stats from demo data
        if (statsBody && typeof DEMO_CORPUS_STATS !== 'undefined') {
            statsBody.innerHTML = '';
            DEMO_CORPUS_STATS.forEach(stat => {
                const tr = document.createElement('tr');
                const tdId = document.createElement('td');
                tdId.textContent = stat.source_file;
                const tdCount = document.createElement('td');
                tdCount.textContent = stat.count;
                tr.appendChild(tdId);
                tr.appendChild(tdCount);
                statsBody.appendChild(tr);
            });
        }
    };

    /**
     * Find the best matching cached response for a given query.
     * Uses exact match first, then falls back to substring/keyword matching.
     */
    const findCachedResponse = (query) => {
        if (typeof DEMO_CACHE === 'undefined') return null;

        // Exact match
        if (DEMO_CACHE[query]) return DEMO_CACHE[query];

        // Normalize and try case-insensitive match
        const lowerQuery = query.toLowerCase().trim();
        for (const [key, value] of Object.entries(DEMO_CACHE)) {
            if (key.toLowerCase() === lowerQuery) return value;
        }

        // Keyword overlap matching: find the cached entry with the most shared words
        const queryWords = new Set(lowerQuery.split(/\s+/).filter(w => w.length > 3));
        let bestMatch = null;
        let bestScore = 0;

        for (const [key, value] of Object.entries(DEMO_CACHE)) {
            const keyWords = new Set(key.toLowerCase().split(/\s+/).filter(w => w.length > 3));
            let overlap = 0;
            for (const word of queryWords) {
                if (keyWords.has(word)) overlap++;
            }
            const score = overlap / Math.max(queryWords.size, 1);
            if (score > bestScore && score >= 0.3) {
                bestScore = score;
                bestMatch = value;
            }
        }

        return bestMatch;
    };

    // === Theme Management ===
    const themeToggleBtn = document.getElementById("theme-toggle");
    const currentTheme = localStorage.getItem("anyrag_theme") || "light";
    
    if (currentTheme === "dark") {
        document.body.classList.add("dark-mode");
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            if (document.body.classList.contains("dark-mode")) {
                localStorage.setItem("anyrag_theme", "dark");
            } else {
                localStorage.setItem("anyrag_theme", "light");
            }
        });
    }

    // === Session Management ===
    let sessionId = localStorage.getItem("anyrag_session_id");
    if (!sessionId) {
        sessionId = "session_" + Math.random().toString(36).substring(2, 9);
        localStorage.setItem("anyrag_session_id", sessionId);
    }
    
    const sessionDisplay = document.getElementById("current-session-id");
    if (sessionDisplay) sessionDisplay.textContent = sessionId;

    const newSessionBtn = document.getElementById("new-session-btn");
    if (newSessionBtn) {
        newSessionBtn.addEventListener("click", () => {
            sessionId = "session_" + Math.random().toString(36).substring(2, 9);
            localStorage.setItem("anyrag_session_id", sessionId);
            sessionDisplay.textContent = sessionId;
            chatHistory.innerHTML = '';
            
            // Show the hero section again
            const hero = document.getElementById('hero-section');
            if (hero) {
                hero.classList.remove('hidden');
                hero.style.opacity = '1';
            }
            
            if (!isDemoMode) {
                addMessage("Started a new fresh session! Upload some data on the Manage panel to begin.", "ai");
            }
            loadStats();
        });
    }

    // === Chat Functions ===
    const scrollToBottom = () => {
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };
    
    // Hide hero section on first message
    const hideHero = () => {
        const hero = document.getElementById('hero-section');
        if (hero && !hero.classList.contains('hidden')) {
            hero.style.opacity = '0';
            setTimeout(() => { hero.classList.add('hidden'); }, 300);
        }
    };

    const addMessage = (content, sender = 'user', isHtml = false) => {
        hideHero();
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', sender);

        const avatarDiv = document.createElement('div');
        avatarDiv.classList.add('avatar');
        avatarDiv.innerHTML = sender === 'user' ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' : 'A';

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('message-content');
        if (isHtml) {
            contentDiv.innerHTML = content;
        } else {
            contentDiv.textContent = content;
        }

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        chatHistory.appendChild(messageDiv);
        scrollToBottom();
        return messageDiv;
    };

    const addTypingIndicator = () => {
        const contentHtml = `
            <div class="typing-indicator">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        `;
        const msg = addMessage(contentHtml, 'ai', true);
        msg.id = 'typing-indicator-msg';
    };

    const removeTypingIndicator = () => {
        const indicator = document.getElementById('typing-indicator-msg');
        if (indicator) {
            indicator.remove();
        }
    };

    const formatAIResponse = (data) => {
        let answerText = "";
        if (typeof data.generation === "string") {
            answerText = data.generation;
        } else if (data.generation && data.generation.answer) {
            answerText = data.generation.answer;
        } else {
            answerText = "Could not generate an answer.";
        }

        answerText = answerText.replace(/\[\s*(\d+)\s*\]/g, (match, num) => {
            return `<span class="source-link">[${num}]</span>`;
        });

        let html = `<p>${answerText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`;

        if (data.sources && data.sources.length > 0) {
            html += `<div class="sources-box">
                <div class="sources-title">Sources Retrieved:</div>`;

            data.sources.forEach((src, idx) => {
                html += `<div class="source-item">
                    <span class="source-link">
                        [${idx+1}] ${(src.source_file||"").toUpperCase()} ${src.chunk_id} - ${src.section_heading}
                    </span>
                </div>`;
            });
            html += `</div>`;
        }

        if (data.generation && data.generation.confidence_metrics) {
            const metrics = data.generation.confidence_metrics;
            html += `<div class="confidence-box" style="margin-top:10px; font-size: 0.85em; color: var(--text-secondary);">
                <strong>Confidence Metrics:</strong>
                Retrieval: ${(metrics.retrieval_confidence * 100).toFixed(1)}% |
                Citation: ${(metrics.citation_coverage * 100).toFixed(1)}% |
                Completeness: ${(metrics.completeness * 100).toFixed(1)}%
            </div>`;
        }

        return html;
    };

    if (chatForm) {
        // Handle Enter key for textarea
        userInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                chatForm.requestSubmit();
            }
        });

        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (!text) return;

            addMessage(text, 'user');
            userInput.value = '';
            userInput.disabled = true;
            addTypingIndicator();

            // === Demo Mode: serve from cache ===
            if (isDemoMode) {
                // Simulate network delay for realism
                await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));
                removeTypingIndicator();

                const cached = findCachedResponse(text);
                let msgDiv;
                if (cached) {
                    msgDiv = addMessage(formatAIResponse(cached), 'ai', true);
                } else {
                    msgDiv = addMessage(
                        `<p>This query is not in the demo cache. In a live deployment, this would trigger the full RAG pipeline.</p>
                        <p style="color: var(--text-dim); margin-top: 8px;">Try one of the sample queries, or <a href="https://github.com/ameynarwadkar/finRAG" style="color: var(--accent-raw);">clone the repo</a> and run it locally with your own API keys.</p>`,
                        'ai', true
                    );
                }

                // Append other clickable queries to the message
                if (typeof DEMO_SAMPLE_QUESTIONS !== 'undefined') {
                    const remainingQueries = DEMO_SAMPLE_QUESTIONS.filter(q => q !== text && (!cached || q !== cached.question));
                    if (remainingQueries.length > 0) {
                        const suggestionsContainer = document.createElement('div');
                        suggestionsContainer.className = 'sample-queries';
                        suggestionsContainer.style.marginTop = '20px';
                        suggestionsContainer.style.borderTop = '1px dashed var(--border-hard)';
                        suggestionsContainer.style.paddingTop = '15px';
                        
                        const label = document.createElement('div');
                        label.className = 'sample-queries-label';
                        label.textContent = 'OTHER SAMPLE QUERIES';
                        suggestionsContainer.appendChild(label);

                        remainingQueries.forEach(q => {
                            const card = document.createElement('div');
                            card.className = 'sample-query-card';
                            
                            const textSpan = document.createElement('span');
                            textSpan.textContent = q;
                            card.appendChild(textSpan);
                            
                            card.addEventListener('click', () => {
                                userInput.value = q;
                                const sendBtn = document.getElementById('send-button');
                                if (sendBtn) {
                                    sendBtn.click();
                                } else {
                                    chatForm.requestSubmit();
                                }
                            });
                            suggestionsContainer.appendChild(card);
                        });
                        
                        const contentDiv = msgDiv.querySelector('.message-content');
                        if (contentDiv) {
                            contentDiv.appendChild(suggestionsContainer);
                            chatHistory.scrollTop = chatHistory.scrollHeight;
                        }
                    }
                }

                userInput.disabled = false;
                userInput.focus();
                return;
            }

            // === Live Mode: hit the backend ===
            try {
                const methodSelect = document.getElementById('retrieval-method');
                const retrievalMethod = methodSelect ? methodSelect.value : "hybrid_rrf";

                const response = await fetch('/v1/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ question: text, session_id: sessionId, retrieval_method: retrievalMethod })
                });

                removeTypingIndicator();

                if (!response.ok) {
                    throw new Error('Server error: ' + response.statusText);
                }

                const data = await response.json();
                addMessage(formatAIResponse(data), 'ai', true);

            } catch (error) {
                removeTypingIndicator();
                addMessage(`<p style="color: #ff7b72;">Error: Could not connect to the assistant. Please try again later.</p>`, 'ai', true);
                console.error(error);
            } finally {
                userInput.disabled = false;
                userInput.focus();
            }
        });
    }

    // === Manage Functions ===
    const loadStats = async () => {
        if (!statsBody) return;
        if (isDemoMode) return; // Stats already populated by activateDemoMode
        try {
            const response = await fetch('/v1/documents?session_id=' + encodeURIComponent(sessionId));
            const data = await response.json();
            
            statsBody.innerHTML = '';
            if (data.length === 0) {
                statsBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">No documents found.</td></tr>';
                return;
            }

            data.forEach(stat => {
                const tr = document.createElement('tr');
                const tdId = document.createElement('td');
                tdId.textContent = stat.source_file;
                const tdCount = document.createElement('td');
                tdCount.textContent = stat.count;
                tr.appendChild(tdId);
                tr.appendChild(tdCount);
                statsBody.appendChild(tr);
            });
        } catch (err) {
            console.error(err);
            statsBody.innerHTML = '<tr><td colspan="2" style="text-align:center;color:#ff7b72;">Failed to load statistics.</td></tr>';
        }
    };

    if (rebuildBtn) {
        rebuildBtn.addEventListener('click', async () => {
            rebuildBtn.disabled = true;
            rebuildBtn.textContent = 'Rebuilding...';
            rebuildStatus.classList.add('hidden');
            rebuildStatus.className = 'status-msg hidden';

            try {
                const response = await fetch('/v1/build_index', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId })
                });
                if (!response.ok) throw new Error('Failed to rebuild indices');
                
                rebuildStatus.textContent = 'Success! Indices are up to date.';
                rebuildStatus.className = 'status-msg success';
            } catch (err) {
                console.error(err);
                rebuildStatus.textContent = 'Error: Could not rebuild indices.';
                rebuildStatus.className = 'status-msg error';
            } finally {
                rebuildBtn.disabled = false;
                rebuildBtn.textContent = 'Rebuild Vector Indices';
            }
        });
    }


    if (uploadForm) {
        uploadForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const fileInput = document.getElementById("file-upload");
            if (!fileInput.files.length) return;

            const formData = new FormData();
            formData.append("session_id", sessionId);
            for (let i = 0; i < fileInput.files.length; i++) {
                formData.append("files", fileInput.files[i]);
            }

            uploadSubmit.disabled = true;
            uploadSubmit.textContent = "Uploading...";
            if(uploadStatus) {
                uploadStatus.classList.remove("hidden");
                uploadStatus.className = "status-msg";
                uploadStatus.textContent = "Uploading and incrementally indexing... Please wait.";
            }
            
            try {
                const res = await fetch("/v1/upload", {
                    method: "POST",
                    body: formData
                });
                
                const data = await res.json();
                if(uploadStatus) {
                    if (data.status === "success") {
                        uploadStatus.className = "status-msg success";
                        uploadStatus.textContent = data.message;
                        fileInput.value = "";
                        loadStats();
                    } else {
                        uploadStatus.className = "status-msg error";
                        uploadStatus.textContent = data.message;
                    }
                }
            } catch (err) {
                if(uploadStatus) {
                    uploadStatus.className = "status-msg error";
                    uploadStatus.textContent = "Error: " + err.message;
                }
            } finally {
                uploadSubmit.disabled = false;
                uploadSubmit.textContent = "Upload and Ingest";
            }
        });
    }

    // === Startup: detect backend or activate demo mode ===
    const init = async () => {
        try {
            const healthCheck = await fetch('/health', { method: 'GET', signal: AbortSignal.timeout(3000) });
            if (!healthCheck.ok) throw new Error('Backend unhealthy');
            // Backend is up, run in live mode
            loadStats();
        } catch {
            // Backend unreachable, activate demo mode
            activateDemoMode();
        }
    };

    init();
});
