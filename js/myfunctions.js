/* your JS code here */
'use strict';
const apiKey = `past here your NASA API key`;

const generalValidationModule = (function () {
    const status = (response) => {
        if (response.status >= 200 && response.status < 300) {
            return Promise.resolve(response)
        } else {
            return Promise.reject(new Error(response.statusText))
        }
    }
    const between = (x, min, max) => {
        return x >= min && x <= max;
    }
    const isValidDateString = (string) => {
        if ((/[0-9]{4}[-][0-9]{2}[-][0-9]{2}/).test(string)) {
            let splitString = string.split('-');
            let year = parseInt(splitString[0]);
            let month = parseInt(splitString[1]);
            let day = parseInt(splitString[2]);
            //check year
            if (between(year, 1900, 9999)) {
                //check month
                if (between(month, 1, 12)) {
                    // check days
                    return (([1, 3, 5, 7, 8, 10, 12].includes(month) && between(day, 1, 31)) ||
                        ([4, 6, 9, 11].includes(month) && between(day, 1, 30)) ||
                        (month === 2 && between(day, 1, 28)) ||
                        (month === 2 && day === 29 && (year % 400 === 0 || (year % 4 === 0 && year % 100 !== 0))))

                }
            }
        }
        return false;
    }
    const isValidNNumString = (string) => {
        return (string.match(/^\d+$/) !== null)
    }
    return {
        isValidNNumString: isValidNNumString,
        isValidDateString: isValidDateString,
        status: status
    };
})();
const missionsModule = (function () {

    const missions = {
        curiosity: {}, opportunity: {}, spirit: {}
    };
    for (const key in missions) {
        fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${key}?api_key=${apiKey}`)
            .then(status)
            .then(res => res.json())
            .then(json => {
                console.log("load");
                missions[key] = {
                    landingDate: json.photo_manifest.landing_date,
                    maxDate: json.photo_manifest.max_date,
                    maxSol: json.photo_manifest.max_sol
                }
            }).then(function () {
            document.getElementById("errorBox").classList.add('d-none');
            document.getElementById("spinner").classList.add('d-none');
            document.getElementById("searchBox").classList.remove('d-none');
        })
            .catch(function () {
                document.getElementById("spinner").classList.add('d-none')
                document.getElementById("errorBox").innerHTML =
                    " NASA servers are not available right now, please try again later";
            })
    }
    return missions;
})();
const validatorModule = (function () {
    const maxDate = (date, rover) => {
        return {
            isValid: date < new Date(missionsModule[rover].maxDate),
            message: `max date is ${missionsModule[rover].maxDate}`
        }
    }
    const minDate = (date, rover) => {
        return {
            isValid: date > new Date(missionsModule[rover].landingDate),
            message: `date must be after ${missionsModule[rover].landingDate}`
        }
    }
    const maxSol = (sol, rover) => {
        return {
            isValid: sol < missionsModule[rover].maxSol,
            message: `max sol is ${missionsModule[rover].maxSol}`
        }
    }

    const minSol = (sol, rover) => {
        return {
            isValid: sol > 0,
            message: `min sol is 0`
        }
    }

    const invalidDateOrSol = () => {
        return {
            isValid: false,
            message: `please enter sol number or valid date`
        }
    }

    return {
        invalidDateOrSol: invalidDateOrSol,
        minSol: minSol,
        minDate: minDate,
        maxSol: maxSol,
        maxDate: maxDate,
    };
})();
document.addEventListener('DOMContentLoaded',
    function () {
        const fullSize = (imgObj) => {
            window.open(`${imgObj.img_src}`, '_blank');
        }
        const saveImg = (imgObj) => {
            const htmlCode = imglistItemHTML(imgObj);
            const newElement = creatNewElement(htmlCode.className, htmlCode.innerHtml, htmlCode.tagName);
            const elements = pictureList.getElementsByTagName('li');
            for (let i = 0; i < elements.length; i++) {
                if (elements[i].children[0].textContent === newElement.children[0].textContent) {
                    alert("This image has already been selected");
                    return;
                }
            }
            pictureList.appendChild(newElement);
        }
        const imagCardHTML = (imgObj) => {
            return {
                tagName: 'div',
                className: `mb-3 col-sm-12 col-md-4 col-lg-3`,
                innerHtml: ` <div class="card">
                                 <img src="${imgObj.img_src}" class="card-img-top" alt="...">
                                 <div class="card-body">
                                   <table class="table">
                                     <tbody>
                                     <tr><td>Earth date:</td>
                                     <td>${imgObj.earth_date}</td></tr>
                                     <tr> <td>Sol:</td>
                                     <td>${imgObj.sol}</td></tr>
                                     <tr> <td>Camera:</td>
                                     <td>${imgObj.camera.name}</td></tr>
                                     <tr> <td>Mission:</td>
                                     <td>${imgObj.rover.name}</td></tr>
                                     </tbody>
                                   </table>
                                   <div class="text-center">
                                 <button type="button" class="btn btn-outline-danger btn-fullSize">full size</button>
                                 <button type="button" class="btn btn-outline-danger btn-save">save</button>

                                   </div>
                                </div>
                              </div>`
            }
        }
        const imagSlideHTML = (element) => {
            return {
                tagName:`div`,
                className: `carousel-item`,
                innerHtml: `<img src="${element.children[0].getAttribute("href")}" class="d-block w-100" alt="...">
                             <div class="carousel-caption d-none d-md-block">
                                <p>${element.children[1].textContent}</p>
                             </div>`
            }
        }
        const imglistItemHTML = (imgObj) => {
            return {
                tagName: "li",
                className: " list-group-item",
                innerHtml: `<a href="${imgObj.img_src}">img id:${imgObj.id}</a>
                            <p>camera:${imgObj.camera.name}, Mission:${imgObj.rover.name}, Earth date:${imgObj.earth_date}, Sol:${imgObj.sol}</p>`
            };
        }
        const creatNewElement = (className, innerHtml, tagName) => {
            const newElement = document.createElement(tagName);
            newElement.className = className;
            newElement.innerHTML += innerHtml;

            return newElement
        }
        const appendImagCard = (imgObj) => {
            const htmlCode = imagCardHTML(imgObj);
            const newElement = creatNewElement(htmlCode.className, htmlCode.innerHtml, htmlCode.tagName)
            imagesBox.appendChild(newElement);
            newElement.getElementsByClassName("btn-fullSize")[0].addEventListener(`click`, function () {
                fullSize(imgObj);
            })
            newElement.getElementsByClassName("btn-save")[0].addEventListener(`click`, function () {
                saveImg(imgObj);
            })


        }
        const isValidInput = (inputElement, validationObj) => {

            let errorElement = inputElement.nextElementSibling; // the error message div
            errorElement.innerHTML = validationObj.isValid ? '' : validationObj.message; // display the error message
            validationObj.isValid ? inputElement.classList.remove("is-invalid") : inputElement.classList.add("is-invalid");
            return validationObj.isValid;
        }
        const validateForm = (formData) => {
            if (generalValidationModule.isValidDateString(formData.dateOrSol.value)) {
                const date = new Date(formData.dateOrSol.value);
                return isValidInput(formData.dateOrSol, validatorModule.maxDate(date, formData.rover.value)) &&
                    isValidInput(formData.dateOrSol, validatorModule.minDate(date, formData.rover.value));
            }
            if (generalValidationModule.isValidNNumString(formData.dateOrSol.value)) {
                const sol = parseInt(formData.dateOrSol.value)
                formData.isEarthDate = false;
                return isValidInput(formData.dateOrSol, validatorModule.maxSol(sol, formData.rover.value)) &&
                    isValidInput(formData.dateOrSol, validatorModule.minSol(sol, formData.rover.value));
            }
            return isValidInput(formData.dateOrSol, validatorModule.invalidDateOrSol());
        }
        const getImagesFromServer = (formData) => {
            fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${formData.rover.value}/photos?${formData.isEarthDate ? `earth_date` : `sol`}=${formData.dateOrSol.value}&camera=${formData.camera.value}&api_key=${apiKey}`)
                .then(status)
                .then(res => res.json())
                .then(json => {
                    searchResults.innerHTML = `${Object.keys(json.photos).length} results found`
                    json.photos.forEach(function (imgObj) {
                        appendImagCard(imgObj)
                    });
                }).then(function () {
                spinner.classList.add('d-none')
            })
                .catch(function () {
                    spinner.classList.add('d-none')
                    searchResults.innerHTML = " NASA servers are not available right now, please try again later";
                })
        }


        const formData = {
            dateOrSol: document.getElementById("dateOrSolInput"),
            rover: document.getElementById("roverInput"),
            camera: document.getElementById("cameraInput"),
            isEarthDate: true //default
        }

        const spinner = document.getElementById("spinner");
        const pictureList = document.getElementById("pictureList");
        const searchResults = document.getElementById("searchResults");
        const imagesBox = document.getElementById("imagesBox");
        const slide = document.getElementById("slide");


        document.getElementById("submit").addEventListener('click', function () {
            spinner.classList.remove('d-none');
            if (validateForm(formData)) {
                getImagesFromServer(formData)
            } else spinner.classList.add('d-none');
        })
        document.getElementById("reset").addEventListener('click', function () {
            imagesBox.innerHTML = "";
            searchResults.innerHTML = "";
        })
        document.getElementById("startSlide").addEventListener('click', function () {
            console.log("hhh")
            const elements = pictureList.getElementsByTagName('li');
            for (let i = 0; i < elements.length; i++) {
                const htmlCode = imagSlideHTML(elements[i]);
                const newElement = creatNewElement(htmlCode.className, htmlCode.innerHtml, htmlCode.tagName)
                slide.appendChild(newElement);
            }
        })

    })


