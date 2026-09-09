
/* =========================================================
   A - ENTERTAINMENT
   MAIN FRONTEND
   FIREBASE / FIRESTORE VERSION
========================================================= */

import {
    db
} from "./firebase-config.js";

import {
    collection,
    getDocs,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


/* =========================================================
   DATA
========================================================= */

let contentData = [];


/* =========================================================
   DOM
========================================================= */

const downloaderToggle =
    document.getElementById("downloaderToggle");

const downloaderPanel =
    document.getElementById("downloaderPanel");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const searchStatus =
    document.getElementById("searchStatus");

const animeGrid =
    document.getElementById("animeGrid");

const movieGrid =
    document.getElementById("movieGrid");

const animeCount =
    document.getElementById("animeCount");

const movieCount =
    document.getElementById("movieCount");

const animeEmpty =
    document.getElementById("animeEmpty");

const movieEmpty =
    document.getElementById("movieEmpty");

const detailSection =
    document.getElementById("detailSection");

const detailClose =
    document.getElementById("detailClose");

const detailPoster =
    document.getElementById("detailPoster");

const detailType =
    document.getElementById("detailType");

const detailTitle =
    document.getElementById("detailTitle");

const detailDescription =
    document.getElementById("detailDescription");

const movieDownloadArea =
    document.getElementById("movieDownloadArea");

const movieDownloadButton =
    document.getElementById("movieDownloadButton");

const episodesArea =
    document.getElementById("episodesArea");

const episodeGrid =
    document.getElementById("episodeGrid");

const episodeCount =
    document.getElementById("episodeCount");

const currentYear =
    document.getElementById("currentYear");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        currentYear.textContent =
            new Date().getFullYear();

        await loadContent();

    }
);


/* =========================================================
   LOAD FIRESTORE CONTENT
========================================================= */

async function loadContent() {

    try {

        searchStatus.textContent =
            "Loading content...";


        const contentQuery =
            query(
                collection(db, "content"),
                orderBy("createdAt", "desc")
            );


        const snapshot =
            await getDocs(contentQuery);


        contentData =
            snapshot.docs.map(doc => ({

                id: doc.id,

                ...doc.data()

            }));


        renderContent(contentData);


        searchStatus.textContent =
            contentData.length
                ? "Showing all content"
                : "No content available yet";


    } catch (error) {

        console.error(
            "Firestore loading error:",
            error
        );


        searchStatus.textContent =
            "Unable to load content";


        animeGrid.innerHTML = "";

        movieGrid.innerHTML = "";


        animeEmpty.hidden = false;
        movieEmpty.hidden = false;


        animeEmpty.querySelector("h3")
            .textContent =
            "Content could not be loaded";


        movieEmpty.querySelector("h3")
            .textContent =
            "Content could not be loaded";

    }

}


/* =========================================================
   DOWNLOADER MENU
========================================================= */

downloaderToggle.addEventListener(
    "click",
    () => {

        const isOpen =
            downloaderPanel.classList.toggle("open");


        downloaderToggle.classList.toggle(
            "active",
            isOpen
        );


        downloaderToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    }
);


/* =========================================================
   OUTSIDE CLICK
========================================================= */

document.addEventListener(
    "click",
    event => {

        const clickedInside =
            downloaderToggle.contains(event.target) ||
            downloaderPanel.contains(event.target);


        if (!clickedInside) {

            downloaderPanel.classList.remove("open");

            downloaderToggle.classList.remove("active");

            downloaderToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);


/* =========================================================
   DOWNLOADER BUTTONS
========================================================= */

document
    .querySelectorAll("[data-downloader]")
    .forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                const type =
                    button.dataset.downloader;

                console.log(
                    `${type} downloader selected`
                );

            }
        );

    });


/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        const queryText =
            searchInput.value
                .trim()
                .toLowerCase();


        clearSearch.classList.toggle(
            "visible",
            queryText.length > 0
        );


        if (!queryText) {

            renderContent(contentData);

            searchStatus.textContent =
                "Showing all content";

            return;

        }


        const filtered =
            contentData.filter(item => {

                const title =
                    String(item.title || "")
                        .toLowerCase();


                const tags =
                    Array.isArray(item.searchTags)
                        ? item.searchTags
                        : [];


                return (
                    title.includes(queryText) ||
                    tags.some(tag =>
                        String(tag)
                            .toLowerCase()
                            .includes(queryText)
                    )
                );

            });


        renderContent(filtered);


        searchStatus.textContent =
            `${filtered.length} result${
                filtered.length === 1
                    ? ""
                    : "s"
            } found for "${searchInput.value.trim()}"`;

    }
);


/* =========================================================
   CLEAR SEARCH
========================================================= */

clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        clearSearch.classList.remove("visible");

        searchStatus.textContent =
            "Showing all content";

        renderContent(contentData);

        searchInput.focus();

    }
);


/* =========================================================
   RENDER CONTENT
========================================================= */

function renderContent(data) {

    const anime =
        data.filter(
            item => item.type === "anime"
        );


    const movies =
        data.filter(
            item => item.type === "movie"
        );


    animeGrid.innerHTML = "";

    movieGrid.innerHTML = "";


    anime.forEach(item => {

        animeGrid.appendChild(
            createContentCard(item)
        );

    });


    movies.forEach(item => {

        movieGrid.appendChild(
            createContentCard(item)
        );

    });


    animeCount.textContent =
        anime.length;


    movieCount.textContent =
        movies.length;


    animeEmpty.hidden =
        anime.length !== 0;


    movieEmpty.hidden =
        movies.length !== 0;

}


/* =========================================================
   CONTENT CARD
========================================================= */

function createContentCard(item) {

    const card =
        document.createElement("article");


    card.className =
        "content-card";


    card.setAttribute(
        "tabindex",
        "0"
    );


    const typeLabel =
        item.type === "anime"
            ? "ANIME"
            : "MOVIE";


    const metaText =
        item.type === "anime"
            ? `${item.episodes?.length || 0} Episodes`
            : "Movie";


    const tags =
        Array.isArray(item.searchTags)
            ? item.searchTags
            : [];


    const firstTags =
        tags
            .slice(0, 2)
            .join(" • ");


    card.innerHTML = `

        <div class="card-image-wrap">

            <img
                class="card-image"
                src="${escapeAttribute(
                    item.imageUrl || ""
                )}"
                alt="${escapeAttribute(
                    item.title || ""
                )}"
                loading="lazy"
                onerror="this.style.opacity='0';"
            >

            <div class="card-overlay"></div>

            <span class="card-type">
                ${typeLabel}
            </span>

        </div>

        <div class="card-body">

            <div class="card-title">
                ${escapeHtml(
                    item.title || "Untitled"
                )}
            </div>

            <div class="card-meta">

                <span>
                    ${escapeHtml(metaText)}
                </span>

                <span class="card-tags">
                    ${escapeHtml(firstTags)}
                </span>

            </div>

        </div>

    `;


    card.addEventListener(
        "click",
        () => openDetail(item)
    );


    card.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" ||
                event.key === " "
            ) {

                event.preventDefault();

                openDetail(item);

            }

        }
    );


    return card;

}


/* =========================================================
   DETAIL
========================================================= */

function openDetail(item) {

    detailSection.hidden = false;


    detailPoster.src =
        item.imageUrl || "";


    detailPoster.alt =
        item.title || "";


    detailType.textContent =
        item.type === "anime"
            ? "ANIME"
            : "MOVIE";


    detailTitle.textContent =
        item.title || "Untitled";


    detailDescription.textContent =
        item.description ||
        "No description available.";


    movieDownloadArea.hidden =
        item.type !== "movie";


    episodesArea.hidden =
        item.type !== "anime";


    if (item.type === "movie") {

        movieDownloadButton.href =
            safeUrl(item.downloadUrl);

    }


    if (item.type === "anime") {

        renderEpisodes(
            Array.isArray(item.episodes)
                ? item.episodes
                : []
        );

    }


    detailSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   EPISODES
========================================================= */

function renderEpisodes(episodes) {

    episodeGrid.innerHTML = "";


    episodeCount.textContent =
        `${episodes.length} Episode${
            episodes.length === 1
                ? ""
                : "s"
        }`;


    episodes.forEach(episode => {

        const card =
            document.createElement("article");


        card.className =
            "episode-card";


        card.innerHTML = `

            <div class="episode-image-wrap">

                <img
                    class="episode-image"
                    src="${escapeAttribute(
                        episode.imageUrl || ""
                    )}"
                    alt="${escapeAttribute(
                        episode.title ||
                        "Episode"
                    )}"
                    loading="lazy"
                    onerror="this.style.opacity='0';"
                >

            </div>

            <div class="episode-body">

                <div class="episode-number">
                    Episode ${escapeHtml(
                        episode.number
                    )}
                </div>

                <div class="episode-title">
                    ${escapeHtml(
                        episode.title ||
                        `Episode ${episode.number}`
                    )}
                </div>

                <a
                    class="episode-download"
                    href="${safeUrl(
                        episode.downloadUrl
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Download ↗
                </a>

            </div>

        `;


        episodeGrid.appendChild(card);

    });

}


/* =========================================================
   CLOSE DETAIL
========================================================= */

detailClose.addEventListener(
    "click",
    () => {

        detailSection.hidden = true;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }
);


/* =========================================================
   ESC
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (event.key !== "Escape") {
            return;
        }


        detailSection.hidden = true;


        downloaderPanel.classList.remove(
            "open"
        );


        downloaderToggle.classList.remove(
            "active"
        );


        downloaderToggle.setAttribute(
            "aria-expanded",
            "false"
        );

    }
);


/* =========================================================
   SAFE URL
========================================================= */

function safeUrl(url) {

    if (!url) {
        return "#";
    }


    try {

        const parsed =
            new URL(
                url,
                window.location.href
            );


        if (
            parsed.protocol === "http:" ||
            parsed.protocol === "https:"
        ) {

            return parsed.href;

        }

    } catch (error) {

        console.warn(
            "Invalid URL:",
            url
        );

    }


    return "#";

}


/* =========================================================
   ESCAPE HTML
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

