import ImageKit from "https://cdn.jsdelivr.net/npm/imagekit-javascript@1.5.4/dist/imagekit.esm.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, update, remove } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Configuration
const firebaseConfig = {
    apiKey: "AIzaSyD0xLuJlNiWr9-VvPOSxeYKXdfxzf1OZHM",
    authDomain: "do-to-list-aa1eb.firebaseapp.com",
    projectId: "do-to-list-aa1eb",
    storageBucket: "do-to-list-aa1eb.firebasestorage.app",
    messagingSenderId: "518478895264",
    appId: "1:518478895264:web:cbcba241dcd91c3ff651c5",
    databaseURL: "https://do-to-list-aa1eb-default-rtdb.firebaseio.com"
};

const imageKitConfig = {
    publicKey: "public_aF1VLWznWZonCwPUp2VzFSZFFjw=",
    urlEndpoint: "https://ik.imagekit.io/rkndkbsiy",
    authenticationEndpoint: "https://fleursdz.netlify.app/.netlify/functions/imagekit-auth"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const mediaRef = ref(db, "media");
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Initialize ImageKit
const imagekit = new ImageKit(imageKitConfig);

// DOM Elements
const elements = {
    authSection: document.getElementById("authSection"),
    adminSection: document.getElementById("adminSection"),
    emailForm: document.getElementById("emailForm"),
    emailInput: document.getElementById("email"),
    passInput: document.getElementById("password"),
    googleBtn: document.getElementById("googleLoginBtn"),
    authMsg: document.getElementById("authMsg"),
    logoutBtn: document.getElementById("logoutBtn"),
    currentUserEl: document.getElementById("currentUser"),
    fileInput: document.getElementById("fileInput"),
    uploadBtn: document.getElementById("uploadBtn"),
    uploadList: document.getElementById("uploadList"),
    gallery: document.getElementById("gallery"),
    defaultAlt: document.getElementById("defaultAlt"),
    refreshBtn: document.getElementById("refreshBtn"),
    dropzone: document.getElementById("dropzone")
};

// Utility Functions
const utils = {
    show: (el) => el.style.display = "",
    hide: (el) => el.style.display = "none",
    setAuthError: (msg) => {
        elements.authMsg.textContent = msg;
        elements.authMsg.style.display = msg ? "block" : "none";
    },
    isVideo: (file) => file.type.startsWith("video/"),
    isImage: (file) => file.type.startsWith("image/"),
    getFileName: (file) => file.name.replace(/\.[^.]+$/, ""),
    createProgressRow: (file) => {
        const row = document.createElement("div");
        row.className = "border rounded p-2";
        row.innerHTML = `
            <div class="small mb-1">${file.name}</div>
            <div class="progress">
                <div class="progress-bar" style="width:0%"></div>
            </div>
        `;
        return row;
    }
};

// Authentication Functions
const authFunctions = {
    loginWithGoogle: () => {
        const isLocal = location.hostname === "localhost" || location.hostname === "127.0.0.1";
        const method = isLocal ? signInWithRedirect : signInWithPopup;
        
        method(auth, provider)
            .then(result => console.log("User signed in:", result.user))
            .catch(err => console.error(`${isLocal ? "Redirect" : "Popup"} Error:`, err));
    },

    handleAuthState: (user) => {
        if (user) {
            utils.hide(elements.authSection);
            utils.show(elements.adminSection);
            elements.currentUserEl.textContent = user.email || "";
        } else {
            utils.show(elements.authSection);
            utils.hide(elements.adminSection);
            elements.currentUserEl.textContent = "";
        }
    },

    handleEmailLogin: async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, elements.emailInput.value, elements.passInput.value);
        } catch (err) {
            utils.setAuthError("فشل تسجيل الدخول. تأكد من البريد وكلمة المرور.");
        }
    }
};

// Media Functions
const mediaFunctions = {
    renderCard: (key, item) => {
        const isVideo = item.type === "video";
        const thumbUrl = isVideo ? `${item.url}#t=0.5` : `${item.url}?tr=w-400,h-400,fo-auto`;
        
        const card = document.createElement("div");
        card.className = "card position-relative";
        card.innerHTML = `
            <span class="badge text-bg-${isVideo ? "dark" : "info"} badge-type">${isVideo ? "فيديو" : "صورة"}</span>
            ${isVideo ? 
                `<video class="w-100" src="${item.url}" preload="metadata" controls></video>` :
                `<img class="w-100 thumb" loading="lazy" src="${thumbUrl}" alt="${item.alt || ""}">`
            }
            <div class="p-2 d-flex gap-2 align-items-center">
                <input class="form-control form-control-sm" value="${item.alt || ""}" placeholder="alt" data-key="${key}"/>
                <button class="btn btn-sm btn-outline-primary save" data-key="${key}">حفظ</button>
                <button class="btn btn-sm btn-outline-danger del" data-key="${key}" data-fileid="${item.fileId || ""}">حذف</button>
            </div>
        `;
        return card;
    },

    paintGallery: (data) => {
        elements.gallery.innerHTML = "";
        if (!data) return;
        
        const entries = Object.entries(data)
            .sort(([,a], [,b]) => (a.order || 0) - (b.order || 0));
            
        entries.forEach(([key, item]) => {
            elements.gallery.appendChild(mediaFunctions.renderCard(key, item));
        });
    },

    uploadFile: async (file) => {
        const row = utils.createProgressRow(file);
        const bar = row.querySelector('.progress-bar');
        elements.uploadList.prepend(row);

        try {
            const result = await imagekit.upload({
                file,
                fileName: file.name,
                useUniqueFileName: true,
                tags: ["fleursdz"],
                folder: "/fleursdz",
                progress: (evt) => {
                    if (evt && evt.loaded && evt.total) {
                        bar.style.width = `${Math.round((evt.loaded / evt.total) * 100)}%`;
                    }
                }
            });

            await push(mediaRef, {
                url: result.url,
                fileId: result.fileId,
                type: utils.isVideo(file) ? "video" : "image",
                alt: elements.defaultAlt.value || utils.getFileName(file),
                order: Date.now(),
                uid: auth.currentUser.uid
            });

            bar.style.width = '100%';
        } catch (err) {
            console.error(err);
            row.classList.add('border-danger');
        }
    },

    handleSaveAlt: async (e) => {
        if (!e.target.classList.contains('save') || !auth.currentUser) return;
        
        const key = e.target.dataset.key;
        const input = e.target.parentElement.querySelector('input');
        
        try {
            await update(ref(db, `media/${key}`), { alt: input.value });
            e.target.classList.replace('btn-outline-primary', 'btn-success');
            e.target.textContent = 'تم';
            
            setTimeout(() => {
                e.target.classList.replace('btn-success', 'btn-outline-primary');
                e.target.textContent = 'حفظ';
            }, 800);
        } catch (err) {
            console.error(err);
            alert('فشل حفظ التعديلات');
        }
    },

    handleDelete: async (e) => {
        if (!e.target.classList.contains('del') || !auth.currentUser) return;
        
        const key = e.target.dataset.key;
        const fileId = e.target.dataset.fileid;
        
        if (!confirm('تأكيد الحذف؟')) return;

        try {
            if (fileId) {
                await fetch('/.netlify/functions/imagekit-delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fileId })
                });
            }
            await remove(ref(db, `media/${key}`));
        } catch (err) {
            console.error(err);
            alert('تعذر الحذف');
        }
    }
};

// Event Listeners
const setupEventListeners = () => {
    // Authentication
    elements.googleBtn?.addEventListener("click", authFunctions.loginWithGoogle);
    elements.emailForm?.addEventListener("submit", authFunctions.handleEmailLogin);
    elements.logoutBtn?.addEventListener("click", () => signOut(auth));
    
    // Drag and Drop
    ["dragenter", "dragover"].forEach(evt => 
        elements.dropzone?.addEventListener(evt, e => {
            e.preventDefault();
            elements.dropzone.style.background = "#eef";
        })
    );
    
    ["dragleave", "drop"].forEach(evt => 
        elements.dropzone?.addEventListener(evt, e => {
            e.preventDefault();
            elements.dropzone.style.background = "#fff";
        })
    );
    
    elements.dropzone?.addEventListener("drop", e => {
        elements.fileInput.files = e.dataTransfer.files;
    });

    // Upload
    elements.uploadBtn?.addEventListener("click", async () => {
        if (!auth.currentUser) return alert("تحتاج لتسجيل الدخول");
        if (!elements.fileInput.files.length) return alert("اختر ملفات أولاً");
        
        const files = Array.from(elements.fileInput.files);
        await Promise.all(files.map(file => mediaFunctions.uploadFile(file)));
        
        elements.fileInput.value = "";
    });

    // Gallery
    elements.gallery?.addEventListener('click', async e => {
        if (e.target.classList.contains('save')) {
            await mediaFunctions.handleSaveAlt(e);
        } else if (e.target.classList.contains('del')) {
            await mediaFunctions.handleDelete(e);
        }
    });

    // Refresh
    elements.refreshBtn?.addEventListener('click', () => window.location.reload());
};

// Initialize
onAuthStateChanged(auth, authFunctions.handleAuthState);
onValue(mediaRef, (snap) => mediaFunctions.paintGallery(snap.val()));
setupEventListeners();
