
// Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) {
        if (menu.classList.contains('hidden')) {
            menu.classList.remove('hidden');
            menu.classList.add('flex');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        } else {
            menu.classList.add('hidden');
            menu.classList.remove('flex');
            document.body.style.overflow = '';
        }
    }
}

// Search Toggle
function toggleSearch() {
    const overlay = document.getElementById('search-overlay');
    if (!overlay) return;

    if (overlay.classList.contains('hidden')) {
        overlay.classList.remove('hidden');
        overlay.classList.add('flex');
        document.body.style.overflow = 'hidden';

        // Focus input
        setTimeout(() => {
            const input = overlay.querySelector('input[type="text"]');
            if (input) input.focus();
        }, 100);
    } else {
        overlay.classList.add('hidden');
        overlay.classList.remove('flex');
        document.body.style.overflow = '';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('Script v57 Loaded'); // Updated Version

    // 0. Format Dates (Remove Time) - Run First
    formatDates();

    // 1. Run Layout Check immediately
    checkLayout();

    // 2. Fix Guestbook Grid
    fixGuestbookGrid();

    // 3. Initialize Features with Retry Logic
    initPersistentFeatures();

    // 4. Initialize Subscribe Button
    initSubscribeButton();

    // 5. Update Comment Avatars (New Feature)
    updateCommentAvatars();

    // 6. Trigger FOUC Reveal (After initial processing)
    revealUI();

    // 7. Guestbook Observer (Auto-Refresh on Modify)
    initGuestbookObserver();
});

// 7. Auto-Refresh Observers (Guestbook & Comments)
function initGuestbookObserver() {
    initAutoRefreshObservers();
}

function initAutoRefreshObservers() {
    // A. Unified XHR Interceptor
    try {
        const originalOpen = XMLHttpRequest.prototype.open;
        const originalSend = XMLHttpRequest.prototype.send;

        XMLHttpRequest.prototype.open = function (method, url) {
            this._url = url;
            this._method = method; // Track method
            return originalOpen.apply(this, arguments);
        };

        XMLHttpRequest.prototype.send = function () {
            this.addEventListener('load', function () {
                // Check for Tistory Guestbook OR Comment Actions
                const isGuestbookAction = this._url && (this._url.includes('/guestbook') || this._url.includes('guestbook'));
                const isCommentAction = this._url && (this._url.includes('/comment') || this._url.includes('comment'));

                // Must be a successful response (200-299)
                if ((isGuestbookAction || isCommentAction) && this.status >= 200 && this.status < 300) {
                    console.log('Detected Action (XHR Success):', this._url);
                    // Reload slightly delayed to allow Tistory to "finish" its internal state
                    setTimeout(() => location.reload(), 100);
                }
            });
            return originalSend.apply(this, arguments);
        };
    } catch (e) { console.error('XHR Intercept failed', e); }

    // B. DOM Observers
    // 1. Guestbook Observer
    setupObserver('guestbook-list', '수정');

    // 2. Comment Observer
    // Tistory usually wraps comments in a container. 
    // In our skin, it's #comments-section -> s_rp_container -> ol/ul
    setupObserver('comments-section', '수정');
}

function setupObserver(targetId, keyword) {
    const target = document.getElementById(targetId);
    if (!target) return;

    let isEditing = false;

    // Detect Entry into Edit Mode
    target.addEventListener('click', (e) => {
        const text = e.target.innerText || '';
        if (text.includes(keyword) || e.target.closest('a')?.innerText.includes(keyword)) {
            isEditing = true;
            console.log(`Edit Mode Entered (${targetId})`);
        }
    });

    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            // Check Removed Nodes (Fastest detection for Tistory Form Removal)
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                for (const node of mutation.removedNodes) {
                    if (node.nodeType === 1) {
                        const isForm = node.tagName === 'FORM' || node.querySelector('form') || node.querySelector('textarea');
                        if (isForm) {
                            console.log(`Edit form removed in ${targetId}. Reloading.`);
                            location.reload();
                            return;
                        }
                    }
                }
            }

            // Check Added Nodes (Unstyled Content)
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        const isForm = node.tagName === 'FORM' || node.querySelector('form') || node.querySelector('textarea');

                        // Strict check: In Editing Mode -> ANY non-form content -> Reload
                        if (isEditing && !isForm && node.tagName !== 'SCRIPT') {
                            console.log(`New content detected in ${targetId} after edit. Reloading.`);
                            isEditing = false;
                            location.reload();
                            return;
                        }
                    }
                }
            }
        }
    });

    observer.observe(target, { childList: true, subtree: true });
}

// Format Dates: Remove HH:MM from date strings
function formatDates() {
    const dateElements = document.querySelectorAll('.date-list, .date-detail, .rp_date');
    dateElements.forEach(el => {
        const text = el.innerText;
        const newText = text.replace(/\s\d{1,2}:\d{2}$/, '');
        if (text !== newText) {
            el.innerText = newText;
        }
    });
}

// FOUC Reveal Logic
function revealUI() {
    // Add small delay to ensure rendering is settled
    setTimeout(() => {
        const targets = [
            document.getElementById('sidebar-desktop'),
            document.getElementById('toc-container'),
            document.getElementById('guestbook-container'),
            document.getElementById('guestbook-list'),
            document.getElementById('guestbook-form'),
            document.getElementById('article-wrapper')
        ];

        targets.forEach(el => {
            if (el) el.classList.add('is-loaded');
        });

        // Ensure all generic cloaked elements are revealed
        document.querySelectorAll('.cloak-until-loaded').forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);

    // Fallback: Force reveal after 1s in case something hangs
    setTimeout(() => {
        const targets = [
            document.getElementById('sidebar-desktop'),
            document.getElementById('toc-container'),
            document.getElementById('guestbook-container'),
            document.getElementById('guestbook-list'),
            document.getElementById('guestbook-form'),
            document.getElementById('article-wrapper')
        ];

        targets.forEach(el => {
            if (el && !el.classList.contains('is-loaded')) el.classList.add('is-loaded');
        });

        // Ensure all generic cloaked elements are revealed
        document.querySelectorAll('.cloak-until-loaded').forEach(el => {
            if (!el.classList.contains('loaded')) el.classList.add('loaded');
        });
    }, 1000);
}

function initPersistentFeatures() {
    // Initial Run
    initTOC();
    styleCategories();
    stylePagination();

    // Retry every 500ms for 3 seconds
    let attempts = 0;
    const interval = setInterval(() => {
        attempts++;
        styleCategories();
        stylePagination();
        fixGuestbookGrid();
        initSubscribeButton();
        updateCommentAvatars(); // Retry avatar update as well

        // Re-trigger reveal in case elements were re-created
        if (attempts === 1) revealUI();

        if (attempts > 6) clearInterval(interval);
    }, 500);
}

// Fix Guestbook Grid
function fixGuestbookGrid() {
    const gb = document.getElementById('guestbook-container');
    if (gb) {
        gb.style.gridColumn = '1 / -1';
        const main = document.querySelector('main');
        if (main && gb.parentElement && gb.parentElement !== main) {
            gb.parentElement.style.gridColumn = '1 / -1';
            gb.parentElement.style.width = '100%';
        }
    }
}

// 1. Table of Contents (TOC)
function initTOC() {
    const content = document.querySelector('.prose');
    const tocContainer = document.getElementById('toc-container');

    if (!content || !tocContainer) return;
    if (tocContainer.dataset.tocInitialized) return;

    const headers = content.querySelectorAll('h2, h3');
    if (headers.length === 0) return;

    tocContainer.dataset.tocInitialized = "true";

    const tocWrapper = document.createElement('div');
    tocWrapper.className = 'sticky top-28';
    tocWrapper.innerHTML = `
        <div class="mb-4 flex items-center gap-2 text-accent font-mono text-xs font-bold uppercase tracking-widest">
            <i class="fa-solid fa-list-ul"></i>
            On this page
        </div>
        <nav class="relative">
            <div class="absolute left-0 top-0 bottom-0 w-px bg-zinc-800"></div>
            <ul class="flex flex-col gap-1" id="toc-list"></ul>
        </nav>
    `;
    tocContainer.appendChild(tocWrapper);
    const tocList = tocWrapper.querySelector('#toc-list');

    headers.forEach((header, index) => {
        if (!header.id) header.id = `toc-heading-${index}`;

        const li = document.createElement('li');
        li.className = 'relative pl-4';

        const a = document.createElement('a');
        a.href = `#${header.id}`;
        a.className = `text-left text-sm transition-all duration-300 hover:text-white leading-relaxed line-clamp-2 py-1 block w-full text-zinc-500 font-normal ${header.tagName === 'H3' ? 'ml-3 text-xs' : ''}`;
        a.textContent = header.textContent;
        a.dataset.targetId = header.id;

        a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(header.id);
            if (target) {
                const y = target.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        });

        li.appendChild(a);
        tocList.appendChild(li);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocList.querySelectorAll('a').forEach(link => {
                    link.classList.remove('text-accent', 'font-medium', '-translate-x-1');
                    link.classList.add('text-zinc-500');
                    const dot = link.parentElement.querySelector('.toc-active-dot');
                    if (dot) dot.remove();
                });

                const activeLink = tocList.querySelector(`a[data-target-id="${id}"]`);
                if (activeLink) {
                    activeLink.classList.remove('text-zinc-500');
                    activeLink.classList.add('text-accent', 'font-medium', '-translate-x-1');
                    const dot = document.createElement('div');
                    dot.className = 'toc-active-dot absolute left-[-1.5px] top-2.5 w-[3px] h-[14px] bg-accent rounded-full transition-all';
                    activeLink.parentElement.appendChild(dot);
                }
            }
        });
    }, { rootMargin: '-100px 0px -60% 0px' });

    headers.forEach(h => observer.observe(h));
}

// 2. Style Categories (Accordion, Icons, Robust Parsing)
function styleCategories() {
    const categoryLists = document.querySelectorAll('.tt_category, #desktop-category-container > ul');

    // Default unified minimal style for all categories
    // For advanced customization, users can add more objects to this array.
    const styles = [
        { icon: 'fa-folder', color: 'text-zinc-400 group-hover:text-accent', activeColor: 'text-accent', bg: 'bg-white/5', activeBg: 'bg-accent/20', border: 'bg-accent' }
    ];

    // Helper: Smart Parse Name and Count
    const parseCategoryLink = (linkElement) => {
        let name = '';
        let count = '';

        const clone = linkElement.cloneNode(true);
        const cntSpan = clone.querySelector('.c_cnt');

        if (cntSpan) {
            count = cntSpan.innerText.replace(/[()]/g, '').trim();
            cntSpan.remove();
        }

        const img = clone.querySelector('img');
        if (img) img.remove();

        let text = clone.innerText.trim();

        if (!count) {
            const parenMatch = text.match(/^(.*)\s*\((\d+)\)$/);
            if (parenMatch) {
                name = parenMatch[1].trim();
                count = parenMatch[2];
            } else {
                const numMatch = text.match(/^(.*)\s+(\d+)$/);
                if (numMatch) {
                    name = numMatch[1].trim();
                    count = numMatch[2];
                } else {
                    name = text;
                }
            }
        } else {
            name = text;
        }

        return { name, count };
    };

    categoryLists.forEach(list => {
        if (list.dataset.processed) return;
        if (list.children.length === 0) return;

        list.dataset.processed = "true";
        list.classList.add('flex', 'flex-col', 'gap-2', 'w-full');
        console.log('Processing Category List v27');

        const currentPath = decodeURIComponent(window.location.pathname);

        const styleAsCard = (item, index, isRoot = false) => {
            const link = item.querySelector(':scope > a') || item.querySelector('a');
            if (!link) return;
            if (link.dataset.cardProcessed) return;
            link.dataset.cardProcessed = "true";

            const style = styles[index % styles.length];
            const subCategoryList = item.querySelector('ul.sub_category_list, ul.category_list');
            const hasSub = !!subCategoryList && subCategoryList.children.length > 0;

            const { name: categoryName, count: countText } = parseCategoryLink(link);

            const linkHref = link.getAttribute('href');
            const isActive = linkHref && (decodeURIComponent(linkHref) === currentPath || (linkHref === '/category' && currentPath === '/category'));

            // Rebuild Link
            link.innerHTML = '';

            const baseBg = isActive ? 'bg-white/10' : 'bg-transparent';
            const textState = isActive ? 'text-white' : 'text-zinc-400';
            const iconStyle = isActive
                ? `${style.activeColor} ${style.activeBg}`
                : `${style.color} ${style.bg}`;
            const borderState = isActive ? 'opacity-100' : 'opacity-0';

            link.className = `group flex items-center justify-between w-full py-2.5 px-3 rounded-xl ${baseBg} hover:bg-white/5 transition-all cursor-pointer relative overflow-hidden select-none mb-0.5`;

            link.innerHTML = `
                <!-- Left Indicator -->
                <div class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 ${style.border} rounded-r-md ${borderState} transition-opacity"></div>
                
                <div class="flex items-center gap-3 z-10 pl-1">
                    <div class="w-8 h-8 rounded-lg flex items-center justify-center shadow-inner transition-colors ${iconStyle}">
                        <i class="fa-solid ${style.icon} text-sm"></i>
                    </div>
                    <span class="text-[15px] font-medium ${textState} group-hover:text-white transition-colors tracking-tight">${categoryName}</span>
                </div>
                
                <div class="flex items-center gap-3 z-10">
                    ${countText ? `<span class="text-xs text-zinc-500 font-mono group-hover:text-zinc-400 transition-colors">${countText}</span>` : ''}
                    ${hasSub && !isRoot ? `<i class="fa-solid fa-chevron-down text-xs text-zinc-600 group-hover:text-zinc-400 transition-transform duration-300"></i>` : ''}
                </div>
            `;

            // Sublist handling
            if (hasSub) {
                const shouldExpand = isActive || (linkHref !== '/category' && currentPath.startsWith(linkHref));

                if (isRoot) {
                    subCategoryList.className = 'flex flex-col gap-2 mt-4 mb-2 w-full animate-fadeIn';
                } else {
                    const displayClass = shouldExpand ? 'flex' : 'hidden';
                    subCategoryList.className = `${displayClass} flex-col gap-0.5 mt-0 mb-3 pl-4 ml-[3.25rem] border-l-2 border-zinc-700/50 space-y-0.5 animate-fadeIn origin-top`;
                }

                if (shouldExpand && !isRoot) {
                    const chevron = link.querySelector('.fa-chevron-down');
                    if (chevron) chevron.style.transform = 'rotate(180deg)';
                }

                const deepLinks = subCategoryList.querySelectorAll('li a');
                deepLinks.forEach(dl => {
                    if (dl.dataset.subProcessed) return;
                    dl.dataset.subProcessed = "true";

                    const { name: sName, count: sCountText } = parseCategoryLink(dl);

                    const sHref = dl.getAttribute('href');
                    const isSubActive = sHref && decodeURIComponent(sHref) === currentPath;
                    const subTextClass = isSubActive ? 'text-white font-bold bg-white/[0.05]' : 'text-zinc-400';

                    dl.className = `flex items-center justify-between py-2.5 px-3 rounded-lg text-[13.5px] ${subTextClass} hover:text-white hover:bg-white/[0.03] transition-all cursor-pointer group/sub relative w-full`;
                    dl.innerHTML = `
                        <!-- Horizontal Tree Connector -->
                        <div class="absolute -left-[18px] top-1/2 -translate-y-1/2 w-[14px] h-[2px] bg-zinc-700/50"></div>
                        
                        <span class="group-hover/sub:translate-x-1 transition-transform duration-300 relative -left-1">${sName}</span>
                        ${sCountText ? `<span class="text-[10px] text-zinc-500 font-mono group-hover/sub:text-zinc-400 transition-colors">${sCountText}</span>` : ''}
                     `;
                });

                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');
                    if (href && (href === '/category' || href.endsWith('/category'))) return;

                    e.preventDefault();
                    const isHidden = subCategoryList.classList.contains('hidden');
                    const chevron = link.querySelector('.fa-chevron-down');
                    if (isHidden) {
                        subCategoryList.classList.remove('hidden');
                        subCategoryList.classList.add('flex');
                        if (chevron) chevron.style.transform = 'rotate(180deg)';
                    } else {
                        subCategoryList.classList.add('hidden');
                        subCategoryList.classList.remove('flex');
                        if (chevron) chevron.style.transform = 'rotate(0deg)';
                    }
                });
            }
        };

        Array.from(list.children).forEach((rootLi, rootIdx) => {
            styleAsCard(rootLi, rootIdx, true);
            const mainUl = rootLi.querySelector('ul');
            if (mainUl) {
                Array.from(mainUl.children).forEach((mainLi, mainIdx) => {
                    styleAsCard(mainLi, mainIdx + 1, false);
                });
            }
        });
    });
}

// 3. Style Pagination
function stylePagination() {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    if (pagination.dataset.processed) return;
    pagination.dataset.processed = "true";

    pagination.classList.add('flex', 'justify-center', 'items-center', 'gap-2', 'mt-12', 'mb-20');

    const links = pagination.querySelectorAll('a');
    links.forEach(link => {
        link.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-bgCard border border-white/5 text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white hover:border-accent/30 transition-all';
        if (link.classList.contains('selected')) {
            link.classList.add('bg-accent', 'text-white', 'border-accent');
        }
    });

    const current = pagination.querySelector('.selected');
    if (current && current.tagName === 'SPAN') {
        current.className = 'w-8 h-8 flex items-center justify-center rounded-lg bg-accent border border-accent text-white text-sm font-bold border-transparent';
        current.style.boxShadow = 'none'; // CRITICAL FIX: Kill lingering Tailwind cache from Tistory
    }
}

// 5. Layout Manager
function checkLayout() {
    let isDetail = document.getElementById('view-indicator-detail');

    const path = window.location.pathname;
    if (!isDetail && (path.includes('/entry/') || /^\/(\d+|m\/entry\/)/.test(path) || path.includes('/guestbook'))) {
        isDetail = true;
    }

    const sidebar = document.getElementById('sidebar-desktop');
    const mainLayout = document.getElementById('main-layout');

    if (isDetail && sidebar && mainLayout) {
        sidebar.classList.remove('lg:block');
        sidebar.style.setProperty('display', 'none', 'important');

        mainLayout.classList.remove('lg:flex-row', 'gap-12');
        mainLayout.classList.add('justify-center');

        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.classList.remove('md:grid-cols-2', 'xl:grid-cols-3', 'xl:gap-8');
            mainContent.classList.add('w-full', 'max-w-4xl', 'mx-auto');
        }
    }

    if (path.includes('/guestbook')) {
        moveGuestbookPagination();
    }
}

function moveGuestbookPagination() {
    const pagination = document.querySelector('.pagination');
    const guestbookForm = document.getElementById('guestbook-form');

    if (pagination && guestbookForm) {
        guestbookForm.parentNode.insertBefore(pagination, guestbookForm);
        pagination.classList.remove('mt-12', 'mb-20');
        pagination.classList.add('my-8');
    }
}

// 6. Subscribe Button Logic (Simplified for Essential Dark)
function initSubscribeButton() {
    const customBtn = document.getElementById('custom-subscribe-btn');
    if (!customBtn) return;
    if (customBtn.dataset.processed) return;

    const tistoryBtn = document.querySelector('.btn_subscription, .u_tistory_btn_subscribe');
    customBtn.dataset.processed = "true";

    if (tistoryBtn) {
        const syncState = () => {
            const isSubscribed = tistoryBtn.classList.contains('following') ||
                tistoryBtn.classList.contains('subscribed') ||
                tistoryBtn.innerText.includes('구독중');

            const label = customBtn.querySelector('.txt_label');
            if (label) {
                label.innerText = isSubscribed ? '구독 중' : '구독하기';
            }

            if (isSubscribed) {
                customBtn.classList.add('subscribed');
            } else {
                customBtn.classList.remove('subscribed');
            }
        };

        syncState();
        customBtn.addEventListener('click', (e) => {
            e.preventDefault();
            tistoryBtn.click();
        });

        const observer = new MutationObserver(() => syncState());
        observer.observe(tistoryBtn, { attributes: true, childList: true, subtree: true });

    } else {
        // If Tistory button doesn't exist, hide custom button to avoid confusion
        customBtn.style.display = 'none';
    }
}

/* Dynamic Avatar Replacement */
function updateCommentAvatars() {
    const comments = document.querySelectorAll('li[id^="comment"]');

    comments.forEach(comment => {
        const img = comment.querySelector('img');
        if (!img) return;

        // Skip if already processed (is my generic avatar)
        if (img.src.startsWith('data:image/svg+xml')) return;

        // Safety: If explicitly Admin/Member, definitely keep (styling fix only)
        if (comment.classList.contains('rp_admin') || comment.classList.contains('rp_member')) {
            img.style.borderRadius = '50%';
            img.classList.remove('guest-avatar-enhanced');
            img.style.padding = '0';
            img.style.background = 'none';
            img.style.border = '1px solid rgba(255,255,255,0.1)';
            return;
        }

        // Heuristic: If it DOES NOT look like a default avatar with specific keywords, assume it's a custom user avatar and keep it.
        // Tistory defaults usually have 'img_profile_default' or 'account_default' or 'profile_default'
        // We use a loose check.
        const src = img.src;
        const isDefault = src.includes('img_profile_default') || src.includes('account_default') || src.includes('profile_default') || src.includes('tistory_admin/static/manage');

        if (!isDefault) {
            // It's a real custom avatar! Keep it.
            img.style.borderRadius = '50%';
            img.classList.remove('guest-avatar-enhanced');
            img.style.padding = '0';
            img.style.background = 'none';
            img.style.border = '1px solid rgba(255,255,255,0.1)';
            return;
        }

        // Only replace if it IS a default avatar
        const genericAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23a1a1aa'%3E%3Cpath fill-rule='evenodd' d='M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z' clip-rule='evenodd' /%3E%3C/svg%3E";
        img.src = genericAvatar;
        img.classList.add('guest-avatar-enhanced');
    });
}
