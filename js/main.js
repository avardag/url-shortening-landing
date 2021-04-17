const hambMenu = document.querySelector(".hamb-menu");
const navigation = document.querySelector(".navigation");
const linksList = document.querySelector(".links");
const urlForm = document.querySelector(".urlForm");
const inputField = document.querySelector(".input-field");
const submitBtn = document.querySelector(".submit-btn");

//hamburger/mobile menu toggle
hambMenu.addEventListener("click", () => {
  console.log("clicked");
  console.log(navigation.style.display);

  navigation.classList.toggle("mobile");
});

const setLoadingOnBtn = () => {
  submitBtn.disabled = true;
  submitBtn.classList.add("button-loading");
};
const unSetLoadingOnBtn = () => {
  submitBtn.disabled = false;
  submitBtn.classList.remove("button-loading");
};

const setErrorOnInputField = (message = "") => {
  if (message === "") {
    inputField.classList.remove("error");
  } else {
    inputField.classList.add("error");
    document.getElementById("error-label-span").innerText = message;
  }
};
//Storage class to manage use of localStorage
class Storage {
  constructor() {
    this.data = window.localStorage.getItem("shortenedLinks");
  }

  saveToStorage(linksObj) {
    if (this.data) {
      const arr = [...JSON.parse(this.data), linksObj];
      window.localStorage.setItem("shortenedLinks", JSON.stringify(arr));
    } else {
      const arr = [linksObj];
      window.localStorage.setItem("shortenedLinks", JSON.stringify(arr));
    }
  }
  getFromStorage() {
    return JSON.parse(this.data);
  }
  clearStorage() {
    window.localStorage.clear();
  }
}
const storage = new Storage();
// storage.clearStorage();
//Func to call API to shorten a link
const fetchUrl = async (url) => {
  try {
    const response = await fetch(`https://api.shrtco.de/v2/shorten?url=${url}`);
    if (!response.ok || response.status === 400)
      throw new Error(response.status);
    const data = await response.json();
    const { full_short_link, original_link } = data.result;
    return {
      full_short_link,
      original_link,
    };
  } catch (err) {
    throw new Error(err);
  }
};

// reder a link container with a button passing links received from API
const renderLinkContainer = ({ full_short_link, original_link }) => {
  return `
  <div class="link-container" data-link=${full_short_link}>
  <div class="ready-link">
    <div class="original-link">${original_link}</div>
    <div class="shortened-link">${full_short_link}</div>
  </div>
  <div class="copy-btn-container">
    <input type="submit" class="btn contained copy-btn" value="Copy"> 
  </div>
 </div>
  `;
};

//Fetch links(if any) from localStorage on page load
const prerenderLinksFromStorage = (linksArr) => {
  linksArr.forEach((l) => {
    linksList.insertAdjacentHTML("afterbegin", renderLinkContainer(l));
  });
};

//fetch links from local Storage
window.addEventListener("DOMContentLoaded", (event) => {
  prerenderLinksFromStorage(storage.getFromStorage());
});

//Event listener on Form Submit, to fetch shortened links
urlForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const urlInput = document.querySelector("#url");
  const url = urlInput.value;
  //check for empty input
  if (url === "") {
    setErrorOnInputField("Please Enter a link");
    return;
  }
  setErrorOnInputField("");
  setLoadingOnBtn();
  try {
    const links = await fetchUrl(url);
    storage.saveToStorage(links);
    linksList.insertAdjacentHTML("afterbegin", renderLinkContainer(links));
  } catch (err) {
    setErrorOnInputField("Please enter a valid link");
  }

  urlForm.reset();
  unSetLoadingOnBtn();
});

//Event listener on Copy Button to copy shortened link
linksList.addEventListener("click", (event) => {
  if (event.target.className.includes("copy-btn")) {
    //reset Copied! styles of all buttons
    document.querySelectorAll(".copy-btn").forEach((button) => {
      button.classList.remove("copied");
      button.value = "Copy";
    });
    //link string in data-link=""
    const link = event.target.parentNode.parentNode.dataset.link;
    // let data = [new ClipboardItem({ "text/plain": link })];
    //write to clipboard
    navigator.clipboard.writeText(link).then(
      function () {
        event.target.classList.add("copied");
        event.target.value = "Copied!";
      },
      function () {
        /* clipboard write failed */
      }
    );
  }
});
