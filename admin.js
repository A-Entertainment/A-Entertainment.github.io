
/* =========================================================
   A - ENTERTAINMENT
   ADMIN DASHBOARD
========================================================= */

import {
    auth,
    db
} from "./firebase-config.js";


import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";


import {
    collection,
    getDocs,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   DOM
========================================================= */

const adminEmail =
    document.getElementById("adminEmail");

const logoutButton =
    document.getElementById("logoutButton");

const newContentButton =
    document.getElementById("newContentButton");

const totalCount =
    document.getElementById("totalCount");

const animeCount =
    document.getElementById("animeCount");

const movieCount =
    document.getElementById("movieCount");

const adminSearch =
    document.getElementById("adminSearch");

const typeFilter =
    document.getElementById("typeFilter");

const contentList =
    document.getElementById("contentList");

const adminEmpty =
    document.getElementById("adminEmpty");

const contentModal =
    document.getElementById("contentModal");

const modalBackdrop =
    document.getElementById("modalBackdrop");

const closeModal =
    document.getElementById("closeModal");

const cancelButton =
    document.getElementById("cancelButton");

const modalTitle =
    document.getElementById("modalTitle");

const contentForm =
    document.getElementById("contentForm");

const contentId =
    document.getElementById("contentId");

const contentType =
    document.getElementById("contentType");

const contentTitle =
    document.getElementById("contentTitle");

const contentImage =
    document.getElementById("contentImage");

const contentDescription =
    document.getElementById("contentDescription");

const contentTags =
    document.getElementById("contentTags");

const movieFields =
    document.getElementById("movieFields");

const movieDownloadUrl =
    document.getElementById("movieDownloadUrl");

const animeFields =
    document.getElementById("animeFields");

const addEpisodeButton =
    document.getElementById("addEpisodeButton");

const episodesEditor =
    document.getElementById("episodesEditor");

const saveButton =
    document.getElementById("saveButton");

const formMessage =
    document.getElementById("formMessage");


/* =========================================================
   STATE
========================================================= */

let allContent = [];

let currentUser = null;


/* =========================================================
   AUTH GUARD
========================================================= */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {
            window.location.replace("login.html");
            return;
        }

        currentUser = user;

        adminEmail.textContent =
            user.email || "Admin";

        await loadContent();
    }
);


/* =========================================================
   LOAD CONTENT
========================================================= */

async function loadContent() {

    try {

        const contentQuery =
            query(
                collection(db, "content"),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(contentQuery);


        allContent =
            snapshot.docs.map(
                item => ({

                    id: item.id,

                    ...item.data()

                })
            );


        updateStats();

        renderContentList();

    } catch (error) {

        console.error(error);

        showFormMessage(
            "Could not load Firestore content.",
            "error"
        );

    }

}


/* =========================================================
   STATS
========================================================= */

function updateStats() {

    const anime =
        allContent.filter(
            item => item.type === "anime"
        ).length;


    const movies =
        allContent.filter(
            item => item.type === "movie"
        ).length;


    totalCount.textContent =
        allContent.length;


    animeCount.textContent =
        anime;


    movieCount.textContent =
        movies;

}


/* =========================================================
   RENDER LIST
========================================================= */

function renderContentList() {

    const search =
        adminSearch.value
            .trim()
            .toLowerCase();


    const filter =
        typeFilter.value;


    const filtered =
        allContent.filter(item => {

            const title =
                String(
                    item.title || ""
                ).toLowerCase();


            const tags =
                Array.isArray(
                    item.searchTags
                )
                    ? item.searchTags.join(" ")
                    : "";


            const matchesSearch =
                !search ||
                title.includes(search) ||
                tags.toLowerCase()
                    .includes(search);


            const matchesType =
                filter === "all" ||
                item.type === filter;


            return (
                matchesSearch &&
                matchesType
            );

        });


    contentList.innerHTML = "";


    adminEmpty.hidden =
        filtered.length !== 0;


    filtered.forEach(item => {

        contentList.appendChild(
            createAdminRow(item)
        );

    });

}


/* =========================================================
   CREATE ADMIN ROW
========================================================= */

function createAdminRow(item) {

    const row =
        document.createElement("div");


    row.className =
        "admin-content-row";


    const episodeCount =
        Array.isArray(item.episodes)
            ? item.episodes.length
            : 0;


    const meta =
        item.type === "anime"
            ? `${episodeCount} episode${
                episodeCount === 1
                    ? ""
                    : "s"
            }`
            : "Movie";


    row.innerHTML = `

        <img
            class="admin-thumbnail"
            src="${escapeAttribute(
                item.imageUrl || ""
            )}"
            alt=""
            onerror="this.style.opacity='0';"
        >


        <div class="admin-content-info">

            <div class="admin-content-title">
                ${escapeHtml(
                    item.title ||
                    "Untitled"
                )}
            </div>


            <div class="admin-content-meta">

                <span class="type-pill">
                    ${item.type === "anime"
                        ? "ANIME"
                        : "MOVIE"}
                </span>

                <span>
                    ${escapeHtml(meta)}
                </span>

            </div>

        </div>


        <div class="admin-row-actions">

            <button
                type="button"
                class="edit-button"
                data-action="edit"
            >
                Edit
            </button>


            <button
                type="button"
                class="delete-button"
                data-action="delete"
            >
                Delete
            </button>

        </div>

    `;


    row
        .querySelector(
            '[data-action="edit"]'
        )
        .addEventListener(
            "click",
            () => openEditModal(item)
        );


    row
        .querySelector(
            '[data-action="delete"]'
        )
        .addEventListener(
            "click",
            () => deleteContent(item)
        );


    return row;

}


/* =========================================================
   OPEN NEW
========================================================= */

newContentButton.addEventListener(
    "click",
    () => {

        openNewModal();

    }
);


function openNewModal() {

    contentForm.reset();

    contentId.value = "";

    episodesEditor.innerHTML = "";

    modalTitle.textContent =
        "Add Content";

    saveButton.textContent =
        "Save Content";

    contentType.value =
        "anime";

    updateConditionalFields();

    clearFormMessage();

    contentModal.hidden = false;

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   OPEN EDIT
========================================================= */

function openEditModal(item) {

    contentId.value =
        item.id;


    contentType.value =
        item.type || "anime";


    contentTitle.value =
        item.title || "";


    contentImage.value =
        item.imageUrl || "";


    contentDescription.value =
        item.description || "";


    contentTags.value =
        Array.isArray(
            item.searchTags
        )
            ? item.searchTags.join(", ")
            : "";


    movieDownloadUrl.value =
        item.downloadUrl || "";


    episodesEditor.innerHTML = "";


    if (
        item.type === "anime" &&
        Array.isArray(item.episodes)
    ) {

        item.episodes.forEach(
            episode => {

                addEpisode(
                    episode
                );

            }
        );

    }


    modalTitle.textContent =
        "Edit Content";


    saveButton.textContent =
        "Update Content";


    updateConditionalFields();

    clearFormMessage();

    contentModal.hidden = false;

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeModalWindow() {

    if (!contentModal) return;

    contentModal.setAttribute("hidden", "");

    document.body.style.overflow = "";

}


if (closeModal) {
    closeModal.addEventListener("click", closeModalWindow);
}

if (cancelButton) {
    cancelButton.addEventListener("click", closeModalWindow);
}

if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeModalWindow);
}


/* =========================================================
   CONTENT TYPE CHANGE
========================================================= */

contentType.addEventListener(
    "change",
    updateConditionalFields
);


function updateConditionalFields() {

    const isAnime =
        contentType.value === "anime";


    animeFields.hidden =
        !isAnime;


    movieFields.hidden =
        isAnime;

}


/* =========================================================
   ADD EPISODE
========================================================= */

addEpisodeButton.addEventListener(
    "click",
    () => {

        addEpisode();

    }
);


function addEpisode(data = {}) {

    const episodeNumber =
        episodesEditor.children.length + 1;


    const wrapper =
        document.createElement("div");


    wrapper.className =
        "episode-editor";


    wrapper.innerHTML = `

        <div class="episode-editor-top">

            <strong>
                Episode
                <span class="episode-number-label">
                    ${episodeNumber}
                </span>
            </strong>


            <button
                type="button"
                class="remove-episode"
            >
                Remove
            </button>

        </div>


        <div class="episode-editor-grid">


            <div class="form-group">

                <label>
                    Number
                </label>

                <input
                    type="number"
                    class="episode-number-input"
                    min="1"
                    value="${escapeAttribute(
                        data.number ??
                        episodeNumber
                    )}"
                    required
                >

            </div>


            <div class="form-group">

                <label>
                    Episode Title
                </label>

                <input
                    type="text"
                    class="episode-title-input"
                    placeholder="Episode 1"
                    value="${escapeAttribute(
                        data.title || ""
                    )}"
                >

            </div>


            <div class="form-group episode-editor-full">

                <label>
                    Episode Image URL
                </label>

                <input
                    type="url"
                    class="episode-image-input"
                    placeholder="https://example.com/episode.jpg"
                    value="${escapeAttribute(
                        data.imageUrl || ""
                    )}"
                    required
                >

            </div>


            <div class="form-group episode-editor-full">

                <label>
                    Episode Download URL
                </label>

                <input
                    type="url"
                    class="episode-download-input"
                    placeholder="https://example.com/download"
                    value="${escapeAttribute(
                        data.downloadUrl || ""
                    )}"
                    required
                >

            </div>

        </div>

    `;


    wrapper
        .querySelector(
            ".remove-episode"
        )
        .addEventListener(
            "click",
            () => {

                wrapper.remove();

                refreshEpisodeNumbers();

            }
        );


    episodesEditor.appendChild(
        wrapper
    );


    refreshEpisodeNumbers();

}


/* =========================================================
   REFRESH EPISODE NUMBERS
========================================================= */

function refreshEpisodeNumbers() {

    [
        ...episodesEditor.children
    ].forEach(
        (episode, index) => {

            const label =
                episode.querySelector(
                    ".episode-number-label"
                );


            if (label) {

                label.textContent =
                    index + 1;

            }

        }
    );

}


/* =========================================================
   SAVE CONTENT
========================================================= */

contentForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const title =
            contentTitle.value.trim();


        const imageUrl =
            contentImage.value.trim();


        const type =
            contentType.value;


        if (!title || !imageUrl) {

            showFormMessage(
                "Title and image URL are required.",
                "error"
            );

            return;

        }


        let episodes = [];


        if (type === "anime") {

            episodes =
                collectEpisodes();

        }


        const searchTags =
            contentTags.value
                .split(",")
                .map(
                    tag =>
                        tag.trim().toLowerCase()
                )
                .filter(Boolean);


        const content = {

            type,

            title,

            imageUrl,

            description:
                contentDescription.value.trim(),

            searchTags,

            episodes,

            downloadUrl:
                type === "movie"
                    ? movieDownloadUrl.value.trim()
                    : "",

            updatedAt:
                serverTimestamp()

        };


        setSaveLoading(true);


        try {

            const existingId =
                contentId.value.trim();


            if (existingId) {

                await updateDoc(
                    doc(
                        db,
                        "content",
                        existingId
                    ),
                    content
                );


                showFormMessage(
                    "Content updated successfully.",
                    "success"
                );

            } else {

                await addDoc(
                    collection(
                        db,
                        "content"
                    ),
                    {
                        ...content,

                        createdAt:
                            serverTimestamp()
                    }
                );


                showFormMessage(
                    "Content added successfully.",
                    "success"
                );

            }


            await loadContent();


            setTimeout(
                closeModalWindow,
                600
            );


        } catch (error) {

            console.error(error);

            showFormMessage(
                getFirestoreError(error),
                "error"
            );

        } finally {

            setSaveLoading(false);

        }

    }
);


/* =========================================================
   COLLECT EPISODES
========================================================= */

function collectEpisodes() {

    const editors =
        [
            ...episodesEditor.children
        ];


    return editors.map(
        editor => {

            const number =
                Number(
                    editor.querySelector(
                        ".episode-number-input"
                    ).value
                );


            const title =
                editor.querySelector(
                    ".episode-title-input"
                ).value.trim();


            const imageUrl =
                editor.querySelector(
                    ".episode-image-input"
                ).value.trim();


            const downloadUrl =
                editor.querySelector(
                    ".episode-download-input"
                ).value.trim();


            return {

                number,

                title,

                imageUrl,

                downloadUrl

            };

        }
    );

}


/* =========================================================
   DELETE CONTENT
========================================================= */

async function deleteContent(item) {

    const confirmed =
        window.confirm(
            `Delete "${item.title}"?\n\nThis cannot be undone.`
        );


    if (!confirmed) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "content",
                item.id
            )
        );


        await loadContent();


    } catch (error) {

        console.error(error);

        alert(
            getFirestoreError(error)
        );

    }

}


/* =========================================================
   SEARCH / FILTER
========================================================= */

adminSearch.addEventListener(
    "input",
    renderContentList
);


typeFilter.addEventListener(
    "change",
    renderContentList
);


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

            window.location.replace(
                "login.html"
            );

        } catch (error) {

            console.error(error);

        }

    }
);


/* =========================================================
   SAVE LOADING
========================================================= */

function setSaveLoading(loading) {

    saveButton.disabled =
        loading;


    saveButton.textContent =
        loading
            ? "Saving..."
            : contentId.value
                ? "Update Content"
                : "Save Content";

}


/* =========================================================
   MESSAGE
========================================================= */

function showFormMessage(
    message,
    type
) {

    formMessage.textContent =
        message;


    formMessage.className =
        `form-message ${type}`;

}


function clearFormMessage() {

    formMessage.textContent =
        "";

    formMessage.className =
        "form-message";

}


/* =========================================================
   FIRESTORE ERRORS
========================================================= */

function getFirestoreError(error) {

    if (
        error.code ===
        "permission-denied"
    ) {

        return "Permission denied. Check your Firebase Security Rules.";

    }


    if (
        error.code ===
        "failed-precondition"
    ) {

        return "Firestore configuration is incomplete.";

    }


    return (
        error.message ||
        "Could not save content."
    );

}


/* =========================================================
   ESCAPE
========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {

    return escapeHtml(value);

}

