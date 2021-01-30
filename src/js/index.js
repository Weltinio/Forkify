// Global app controller
const searchInput = document.querySelector('.search__field')
const form = document.querySelector('.search')
let loader = document.querySelector(".loader")
let currentPage = 1;
let rows = 10;

let resultLoader = () => {
    let parent = document.querySelector('.results__list')
    let load = document.querySelector('.loader')
    if (load !== null) {
        load.parentElement.remove();
    }
    else {
    let loader = document.createElement('div')
    loader.innerHTML = `<div class="loader" id="results__list_loader">
    <svg>
        <use href="../dist/img/icons.svg#icon-cw"></use>
    </svg>
    </div>`
    parent.insertBefore(loader, parent.firstChild)
    }
}

let recipeLoader = () => {
    let parent = document.querySelector('.recipe')
    let load = document.querySelector('.loader')
    if (load !== null) {
        load.parentElement.remove();
    }
    else {
    let loader = document.createElement('div')
    loader.innerHTML = `<div class="loader" id="recipe__list_loader">
    <svg>
        <use href="../dist/img/icons.svg#icon-cw"></use>
    </svg>
    </div>`
    parent.insertBefore(loader, parent.firstChild)
    }
}

const addLike = (like) => {
    let parent = document.querySelector('.likes__list')
    let div = document.getElementById(`${like.id}`)
    if (div !== null) {
        div.parentElement.remove();
    }
    else {
        let li = document.createElement('li')
        li.innerHTML = `<li>
        <a class="likes__link" href="${like.source_url}">
            <figure class="likes__fig">
                <img src="${like.image_url}" alt="${like.title}">
            </figure>
            <div class="likes__data" id="${like.id}">
                <h4 class="likes__name">${like.title}</h4>
                <p class="likes__author">${like.publisher}</p>
            </div>
        </a>
        </li>`
        parent.appendChild(li);
    }
}


const showShoppingList = (recipeResponse) => {
    let list = document.querySelector('.shopping__list')
    list.innerHTML = ''
    for (var i = 0; i < recipeResponse.ingredients.length; i++) {

        let li = document.createElement('li')
        li.classList.add("shopping__item")

        if (recipeResponse.ingredients[i].quantity == null) {
            recipeResponse.ingredients[i].quantity = ""
        }
        li.innerHTML = `
                <div class="shopping__count">
                    <input type="number" value="${recipeResponse.ingredients[i].quantity}" step="100">
                    <p>${recipeResponse.ingredients[i].unit}</p>
                </div>
                <p class="shopping__description">${recipeResponse.ingredients[i].description}</p>
                <button class="shopping__delete btn-tiny">
                    <svg>
                        <use href="../dist/img/icons.svg#icon-circle-with-cross"></use>
                    </svg>
                </button>
                `
        list.appendChild(li);
    }
    var closeButton = document.getElementsByClassName("shopping__delete");
    for (var j = 0; j < closeButton.length; j++) {
        closeButton[j].onclick = function () {
            var div = this.parentElement;
            div.style.display = "none";
        }
    }
}



const addServings = (recipeResponse, callback) => {
    let numberOfServings = document.querySelector(".recipe__info-data--people")
    recipeResponse.servings++
    let x = recipeResponse.servings - 1
    numberOfServings.textContent = recipeResponse.servings
    callback(recipeResponse, x)
}

const subtractServings = (recipeResponse, callback) => {
    let numberOfServings = document.querySelector(".recipe__info-data--people")
    if (recipeResponse.servings > 1) {
        recipeResponse.servings--
        let x = recipeResponse.servings + 1
        numberOfServings.textContent = recipeResponse.servings
        callback(recipeResponse, x)
    }
}

const calculateServings = (recipeResponse, x) => {
    let quantity = document.getElementsByClassName("recipe__count")
    for (var i = 0; i < recipeResponse.ingredients.length; i++) {
        if (recipeResponse.ingredients[i].quantity == null) {
            recipeResponse.ingredients[i].quantity = 0
        }
        recipeResponse.ingredients[i].quantity = round((recipeResponse.ingredients[i].quantity / x) * recipeResponse.servings, 2)
        quantity[i].textContent = numberToFraction(recipeResponse.ingredients[i].quantity)
    }

}

const round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

function numberToFraction(amount) {
    // This is a whole number and doesn't need modification.
    if (parseFloat(amount) === parseInt(amount) ) {
        return amount;
    }
    let gcd = function(a, b) {
        if (b < 0.0000001) {
            return a;
        }
        return gcd(b, Math.floor(a % b));
    };
    var len = amount.toString().length - 2;
    var denominator = Math.pow(10, len);
    var numerator = amount * denominator;
    var divisor = gcd(numerator, denominator);
    numerator /= divisor;
    denominator /= divisor;
    var base = 0;
    // In a scenario like 3/2, convert to 1 1/2
    // by pulling out the base number and reducing the numerator.
    if ( numerator > denominator ) {
        base = Math.floor( numerator / denominator );
        numerator -= base * denominator;
    }
    amount = Math.floor(numerator) + '/' + Math.floor(denominator);
    if ( base ) {
        amount = base + ' ' + amount;
    }
    return amount;
};

const displayList = (items, wrapper, rows_per_page, page) => {
    wrapper.innerHTML = ""
    page--

    let start = rows_per_page * page;
    let end = start + rows_per_page;
    let paginatedItems = items.slice(start, end)
    
    for (let i = 0; i < paginatedItems.length; i++) {
        let item = paginatedItems[i];
        let item_element = document.createElement('li');

        item_element.innerHTML = `
            <a class="results__link results__link--active" href="#${item.id}">
            <figure class="results__fig">
                <img src="${item.image_url}" alt="${item.title}">
            </figure>
            <div class="results__data">
                <h4 class="results__name">${item.title}</h4>
                <p class="results__author">${item.publisher}</p>
            </div>
            </a>`
        wrapper.appendChild(item_element);
        item_element.onclick = () => {
            showPage(item)
        }
    }
}

const displayPages = () => {
    let parent_div = document.querySelector(".results__pages")
    parent_div.innerHTML=`
    <button class="btn-inline results__btn--prev">
        <svg class="search__icon">
        <use href="../dist/img/icons.svg#icon-triangle-left"></use>
         </svg>
        <span class="prev_page"></span>
    </button>
    <button class="btn-inline results__btn--next">
        <span class="next_page">Page 2</span>
        <svg class="search__icon">
        <use href="../dist/img/icons.svg#icon-triangle-right"></use>
        </svg>
    </button>`
}

const showPage = (recipe) => {
    let yhttp = new XMLHttpRequest();
    yhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {

            let respo = this.response;
            let respoParse = JSON.parse(respo)
            let recipeResponse = respoParse.data.recipe
            let contentParent = document.querySelector('.recipe')
            contentParent.innerHTML = ""
            let content = `
                <figure class="recipe__fig">
                <img src="${recipeResponse.image_url}" alt="${recipeResponse.title}" class="recipe__img">
                <h1 class="recipe__title">
                    <span>${recipeResponse.title}</span>
                </h1>
                </figure>
                <div class="recipe__details">
                    <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="../dist/img/icons.svg#icon-stopwatch"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--minutes">${recipeResponse.cooking_time}</span>
                    <span class="recipe__info-text"> minutes</span>
                </div>
                <div class="recipe__info">
                    <svg class="recipe__info-icon">
                        <use href="../dist/img/icons.svg#icon-man"></use>
                    </svg>
                    <span class="recipe__info-data recipe__info-data--people">${recipeResponse.servings}</span>
                    <span class="recipe__info-text"> servings</span>

                    <div class="recipe__info-buttons">
                        <button class="btn-tiny btn-minus">
                            <svg>
                                <use href="../dist/img/icons.svg#icon-circle-with-minus"></use>
                            </svg>
                        </button>
                        <button class="btn-tiny btn-add">
                            <svg>
                                <use href="../dist/img/icons.svg#icon-circle-with-plus"></use>
                            </svg>
                        </button>
                    </div>

                </div>
                <button class="recipe__love">
                    <svg class="header__likes">
                        <use href="../dist/img/icons.svg#icon-heart-outlined"></use>
                    </svg>
                </button>
            </div>
           
            <div class="recipe__ingredients">
                <ul class="recipe__ingredient-list">
                </ul>
  
                <button class="btn-small recipe__btn add_to_cart">
                    <svg class="search__icon">
                        <use href="../dist/img/icons.svg#icon-shopping-cart"></use>
                    </svg>
                    <span>Add to shopping list</span>
                </button>
            </div>

            <div class="recipe__directions">
                <h2 class="heading-2">How to cook it</h2>
                <p class="recipe__directions-text">
                    This recipe was carefully designed and tested by
                    <span class="recipe__by">${recipeResponse.publisher}</span>. Please check out directions at their website.
                </p>
                <a class="btn-small recipe__btn" href="${recipeResponse.source_url}" target="_blank">
                    <span>Directions</span>
                    <svg class="search__icon">
                        <use href="../dist/img/icons.svg#icon-triangle-right"></use>
                    </svg>

                </a>
            </div>`
            contentParent.insertAdjacentHTML('afterbegin', content)

            for (var i = 0; i < recipeResponse.ingredients.length; i++) {
                if (recipeResponse.ingredients[i].quantity == null) {
                    recipeResponse.ingredients[i].quantity = ""
                }


                let ul = document.querySelector('.recipe__ingredient-list');
                let li = document.createElement('li');
                li.classList.add("recipe__item");
                li.innerHTML = (`
                   <svg class="recipe__icon">
                            <use href="../dist/img/icons.svg#icon-check"></use>
                        </svg>
                        <div class="recipe__count">${recipeResponse.ingredients[i].quantity}</div>
                        <div class="recipe__ingredient">
                            <span class="recipe__unit">${recipeResponse.ingredients[i].unit}</span>
                            ${recipeResponse.ingredients[i].description}
                        </div>
              `);

                // Append each li to the ul
                ul.appendChild(li);
            }

            let addToCartBTN = document.querySelector(".add_to_cart")
            addToCartBTN.onclick = () => {
                showShoppingList(recipeResponse)
            }

            let addServingButton = document.querySelector(".btn-add")
            addServingButton.onclick = function () {
                addServings(recipeResponse, calculateServings)
            }

            let subtractServingButton = document.querySelector(".btn-minus")
            subtractServingButton.onclick = function () {
                subtractServings(recipeResponse, calculateServings)
            }

            let likeBtn = document.querySelector('.recipe__love')
            likeBtn.onclick = () => {
                addLike(recipeResponse)
            }
        }

    }

    yhttp.open("GET", `https://forkify-api.herokuapp.com/api/v2/recipes/${recipe.id}`, true);
    recipeLoader();
    yhttp.send();
}

form.onsubmit = (event) => {
    currentPage = 1;
    event.preventDefault();
    const xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let respo = this.response;
            let respoParse = JSON.parse(respo)
            let list = document.querySelector('.results__list')
            //console.log(respoParse.data.recipes.length)
            displayList(respoParse.data.recipes, list, rows, currentPage)
            displayPages()

            let btn_previous = document.querySelector(".results__btn--prev")
            let btn_next = document.querySelector(".results__btn--next")
            let prev_page = document.querySelector(".prev_page")
            let next_page = document.querySelector(".next_page")

            btn_previous.style.display="none";
            
            btn_previous.onclick = () => {
                btn_next.style.display="block";
                currentPage--
                if(currentPage == 1){
                    btn_previous.style.display="none";
                }
                displayList(respoParse.data.recipes, list, rows, currentPage)
                prev_page.textContent = `Page ${currentPage-1}`
                next_page.textContent = `Page ${currentPage+1}`

            }
            btn_next.onclick = () => {
                btn_previous.style.display="block";
                currentPage++
                if(currentPage == Math.ceil(respoParse.data.recipes.length/rows)){
                    btn_next.style.display="none";
                }
                displayList(respoParse.data.recipes, list, rows, currentPage)
                prev_page.textContent = `Page ${currentPage-1}`
                next_page.textContent = `Page ${currentPage+1}`
                
            }
           
        }
        
    };
    xhttp.open("GET", `https://forkify-api.herokuapp.com/api/v2/recipes?search=${searchInput.value}`, true);
    resultLoader();
    xhttp.send();
}