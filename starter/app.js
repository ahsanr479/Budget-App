//Budget controller
var budgetController = (function(){
    var Expense=function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/ totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }

    var Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }

    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals: {
            exp:0,
            inc:0
        },
        budget: 0,
        percentage: -1
        
    }

    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function(typ,des,val){
            var newItem,ID;
            if(data.allItems[typ].length > 0){
                ID = data.allItems[typ][data.allItems[typ].length - 1].id + 1;
            } else {
                ID = 0;
            }
            if(typ === 'exp'){
                newItem = new Expense(ID,des,val);
            } else if(typ === 'inc') {
                newItem = new Income(ID,des,val);
            }
            data.allItems[typ].push(newItem);
            return newItem
        },
        deleteItem: function(type,ID){
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });

            var index = ids.indexOf(ID);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },

        calculateBudget: function(){
            calculateTotal('exp');
            calculateTotal('inc');
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0 ){
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentage(data.totals.inc);
            })
        },
        getPercentages: function(){
            var allPercs = data.allItems.exp.map(function(current){
                return current.getPercentage();
            });
            return allPercs;
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    }
})();


//UI controller
var UIController = (function(){

    var DOMStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputButton: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var numSplit,int,dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');

        int = numSplit[0];

        dec = numSplit[1];

        if(int.length > 3){
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,int.length);
        }

        return (type === 'exp' ? '-':'+') + ' ' + int + '.' + dec;


    }
    return {
        getInput: function(){
            return {
                type: document.querySelector(DOMStrings.inputType).value,
                description: document.querySelector(DOMStrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMStrings.inputValue).value)
            }
    
        },

        
        addListItem:function(obj, type){
            var html, newHtml,element;
            if(type === 'inc'){
                element = DOMStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === 'exp'){
                element = DOMStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%description%',obj.description);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));

            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml); 

        },

        deleteListItem: function(selectorID){
            var element = document.getElementById(selectorID)
            element.parentNode.removeChild(element);
        },

        clearFeilds: function(){
            var feilds,feildsArray;

            feilds = document.querySelectorAll(DOMStrings.inputDescription + "," + DOMStrings.inputValue);
            feildsArray = Array.prototype.slice.call(feilds);
            feildsArray.forEach(function(current, index, array){
                current.value = '';
            });

            feildsArray[0].focus();
        },
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'inc': type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMStrings.percentageLabel).textContent = '---';
            }
        },
        displayPercentages: function(percentages){
            var feilds = document.querySelectorAll(DOMStrings.expensesPercentageLabel);

            var nodeListForEach = function(list,callback) {
                for(var i = 0;i<list.length;i++){
                    callback(list[i],i);
                }
            }

            nodeListForEach(feilds,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] +'%';
                } else{
                    current.textContent = "---"
                }
            });
        },
        displayMonth: function(){
            var now,year,month,monthsArray; 
            
            now = new Date();
            monthsArray = [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July',
                'August',
                'September',
                'October',
                'November',
                'December'
                ];

            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMStrings.dateLabel).textContent =  monthsArray[month - 1] + " " + year;
        },
        getDOMStrings: function(){
            return DOMStrings;
        }
    };
}());


//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){

    var setUpEventListeners = function(){
        document.querySelector(DOM.inputButton).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    


   var DOM = UICtrl.getDOMStrings();
   
   var updateBudget = function(){
       budgetCtrl.calculateBudget();
       var budget = budgetCtrl.getBudget();
       UICtrl.displayBudget(budget);
   }

   var updatePercentages = function(){
    budgetCtrl.calculatePercentages();
    var percentages = budgetCtrl.getPercentages();
    console.log(percentages);
    UICtrl.displayPercentages(percentages);

   };

   var ctrlAddItem = function(){
       var input,newItem;

       input = UICtrl.getInput();
       newItem = budgetCtrl.addItem(input.type,input.description,input.value);
       UICtrl.addListItem(newItem, input.type);
       UICtrl.clearFeilds();
       updateBudget();
       updatePercentages();
   } 

   var ctrlDeleteItem = function(event){
       var itemId,splitId,type,ID;
       itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
       if(itemId){
           splitId = itemId.split('-');
           type = splitId[0];
           ID = parseInt(splitId[1]);
           budgetCtrl.deleteItem(type,ID);
           UICtrl.deleteListItem(itemId);
           updateBudget();
           updatePercentages();
           
           
       }
   }
   

   return{
       init: function(){
           UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        });
           setUpEventListeners();
           UICtrl.displayMonth();
       }
   }

  
})(budgetController,UIController);

controller.init();
