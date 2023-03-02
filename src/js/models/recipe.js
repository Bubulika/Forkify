import axios from "axios";


export default class Recipe {

    constructor(id){
        this.id = id;
    }

    async getRecipe(){

        try {
            
        const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`)
        this.title = res.data.recipe.title;
        this.author = res.data.recipe.publisher;
        this.img = res.data.recipe.image_url;
        this.url = res.data.recipe.source_url
        this.ingredients = res.data.recipe.ingredients

        } catch (error) {
            alert(error)
        }
        
    }

    calcTime(){
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng /3 );
        this.time = periods * 15;
    }

    calcServings(){
        this.servings = 4;
    }

    parseIngredients(){
        const newIngredients = this.ingredients.map( el => {
            const unitLong = ['tablespoons', 'tablespoon', 'ounces', 'ounce', 'teaspoons', 'teaspoon', 'cups']
            const unitShorts = ['tbsp', 'tbsp', 'oz', 'oz', 'tsp', 'tsp', 'cup'];
            const units = [...unitShorts, 'kg', 'g', 'pound']
    
            //1. uniform unit
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit, i ) => {
                ingredient = ingredient.replace(unit, unitShorts[i])
            })

            //2. remove paranetheses
            ingredient = ingredient.replace( / *\([^)]*\) */g, " ");

            //3. parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(value => units.includes(value))
            let objIng;
            if(unitIndex > -1){
                // there is unit 
                // ex: 4; [4]
                // ex: 4 1/2; [4, 1/2] => 4.5
                // ex: 1/2; => 0.5
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if(arrCount.length === 1){
                    count = eval(arrIng[0])
                }else{
                    // ['4', '1/2'] => 4.5
                    count = eval(arrCount.join('+')) 
                }

                objIng ={
                    count, // count: count
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }

            }else if(parseInt(arrIng[0], 10)){ //NaN
                // there is no unit, but number
                objIng = {
                    count: +arrIng[0],
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }

            }else if(unitIndex === -1){
                objIng = {
                    count: '',
                    unit: '',
                    ingredient
                }
            }

            return objIng;
        })
        this.ingredients = newIngredients;
    }

    updateServings(type){
        //Servings
        const newServings = type === 'dec' ? this.servings - 1 : this.servings + 1

        // Ingredients
        this.ingredients.forEach(ing => ing.count *= (newServings / this.servings))
        this.servings = newServings;
        
    }
}