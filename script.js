console.log("Flipbook v15_fixed_embed2 loaded");

const mediaFolder = "media/";
let currentSpread = 0;
let currentMediaIndex = 0;
let mediaFiles = [
  "medium1_spread3.jpg",
  "medium2_spread3.gif",
  "medium3_spread4.gif",
  "medium4_spread5_dQw4w9WgXcQ.youtube",
  "medium5_spread6_76979871.vimeo",
  "medium6_spread7.mp4"
];

const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightbox-content");
const lightboxClose = document.getElementById("lightbox-close");

function openLightbox(index) {
  currentMediaIndex = index;
  showMedia(mediaFiles[index]);
  lightbox.classList.remove("hidden");
}

function closeLightbox() {
  lightbox.classList.add("hidden");
  lightboxContent.innerHTML = "";
}

function showMedia(filename) {
  lightboxContent.innerHTML = "";
  console.log("Opening media:", filename);

  if (filename.endsWith(".jpg") || filename.endsWith(".png") || filename.endsWith(".gif")) {
    const img = document.createElement("img");
    img.src = mediaFolder + filename;
    lightboxContent.appendChild(img);
  } else if (filename.endsWith(".mp4") || filename.endsWith(".webm")) {
    const video = document.createElement("video");
    video.src = mediaFolder + filename;
    video.controls = true;
    lightboxContent.appendChild(video);
  } else if (filename.endsWith(".youtube")) {
    const parts = filename.split("_");
    const ytId = parts[2] ? parts[2].replace(".youtube","") : null;
    console.log("Parsed YouTube ID:", ytId);

    if (ytId) {
      const iframe = document.createElement("iframe");
      iframe.src = "https://www.youtube.com/embed/" + ytId;
      iframe.width = "800";
      iframe.height = "450";
      iframe.frameBorder = "0";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      lightboxContent.appendChild(iframe);
    } else {
      const a = document.createElement("a");
      a.href = "https://www.youtube.com";
      a.target = "_blank";
      a.innerText = "Otevřít na YouTube";
      lightboxContent.appendChild(a);
    }
  } else if (filename.endsWith(".vimeo")) {
    const parts = filename.split("_");
    const vimeoId = parts[2] ? parts[2].replace(".vimeo","") : null;
    console.log("Parsed Vimeo ID:", vimeoId);

    if (vimeoId) {
      const iframe = document.createElement("iframe");
      iframe.src = "https://player.vimeo.com/video/" + vimeoId;
      iframe.width = "800";
      iframe.height = "450";
      iframe.frameBorder = "0";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.allowFullscreen = true;
      lightboxContent.appendChild(iframe);
    } else {
      const a = document.createElement("a");
      a.href = "https://vimeo.com";
      a.target = "_blank";
      a.innerText = "Otevřít na Vimeo";
      lightboxContent.appendChild(a);
    }
  }
}

lightboxClose.addEventListener("click", closeLightbox);
