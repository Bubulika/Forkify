// Global app controller
import * as searchView from './views/searchView'
import * as recipeView from './views/recipeView'
import * as listView from './views/listView'
import * as likesView from './views/likesView'
import { clearLoader, elements, renderLoader } from "./views/base";
import Search from './models/search';
import Recipe from './models/recipe';
import List from './models/list';
import Likes from './models/like';


const state = {}
window.state = state;
// Search controller

const controlSearch = async () => {

    // Get query from view(მოგვაქვს value input-ელემენტის)
    const query = searchView.getInput();
    
    if(query){
        // New Search Object and add state
        state.search = new Search(query);
        // Prepare UI for result
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchResList)

        try {
            await state.search.getResults();

            clearLoader();
            searchView.renderResult(state.search.result)
        } catch (error) {
            alert("Error Search")
        }
        
    }



}
elements.searchForm.addEventListener('submit', (e) =>{
    e.preventDefault();
    controlSearch();
})

elements.searchResPages.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-inline')

    if(btn){
        const gotoPage = +btn.dataset.goto;
        searchView.clearResults()
        searchView.renderResult(state.search.result, gotoPage)
    }
})

const controlRecipe = async () => {
    // Get Id from url
    const id = window.location.hash.replace('#', '');
    console.log(id)

    if(id){
        //Prepare UI
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        //Highlight selected search items
        if(state.search) searchView.highlightSelected(id);

        // Create new recipe object
        state.recipe = new Recipe(id);

        try {
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();

            //Calculate Servings and Time 
            state.recipe.calcTime();
            state.recipe.calcServings();

            clearLoader();
            recipeView.renderRecipe(state.recipe, state.likes.isLiked(id))
        } catch (error) {
            alert('Error Recipe')
        }
    }

}

window.addEventListener('load', () => {
    state.likes = new Likes()
    likesView.toggleMenu(state.likes.getNumLikes())
})

window.addEventListener('hashchange', controlRecipe)
window.addEventListener('load', controlRecipe)

// Shopping List controller 

const controllerList = () => {
    //create new List
    state.list = new List();

    // Add each ingredients
    state.recipe.ingredients.forEach(ing => {
        const item = state.list.addItems(ing.count, ing.unit, ing.ingredient)
        listView.renderItem(item);
    })
}

// Handling delete and update list item
elements.shopping.addEventListener('click', e =>{
const id = e.target.closest('.shopping__item').dataset.itemid

    if(e.target.matches('.shopping__delete, .shopping__delete *')){
        // Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItems(id);

    }else if(e.target.matches('.shopping__count-value')){
        // Updates
        const val = +e.target.value;
        state.list.updateCount(id, val)
    }
})

// Like Controller
const controllerLike = () => {
    if(!state.likes) state.likes = new Likes();

    const currentID = state.recipe.id
    if(!state.likes.isLiked(currentID)){
        // Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // Toggle to the button 
            likesView.toggleLikeBtn(true);
        // Add like to UI list
        likesView.renderLike(newLike)
    }else{
        //Remove like from state
        state.likes.deleteLike(currentID)

        // Toggle to the button 
        likesView.toggleLikeBtn(false);

        // Remove like from UI list
        likesView.deleteLike(currentID)
    }

    likesView.toggleMenu(state.likes.getNumLikes());
}



// Handling Recipe button click (minus, plus, like, add shopping list)

elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')){
        // Decrease button is clicked
        if(state.recipe.servings > 1){
            state.recipe.updateServings('dec')
            recipeView.updateServingsIngredients(state.recipe)
        }
        
    }else if(e.target.matches('.btn-increase, .btn-increase *')){
        // Increase button is clicked
        state.recipe.updateServings('inc')
        recipeView.updateServingsIngredients(state.recipe)
    }else if(e.target.matches('.recipe__love, .recipe__love *')){
        // like contoller
        controllerLike();
    }else if(e.target.matches('.recipe__btn__add, .recipe__btn__add *')){
        // Shopping list controller
        controllerList();
    }
})