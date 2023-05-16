<script setup lang="ts">

</script>

<template>
  <div class="flex flex-col items-center grow bg-white m-16 rounded-xl shadow-xl shadow-teal-700">
      <p class="header text-5xl m-5">Homeowners</p>
      <div class="form-control w-full max-w-xs m-5">
          <label class="label">
              <span class="label-text font-semibold">Pick a file</span>
          </label>
          <input type="file" @change="handleFileSelection" accept=".csv" class="file-input file-input-bordered file-input-primary w-full max-w-xs" />
          <label class="label">
              <span class="label-text-alt">Only .csv file are allowed</span>
          </label>
      </div>
      <div class="grow mx-5 mt-5 m-10 flex flex-col justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 animate-spin" v-bind:class = "(loading)?'':'hidden'">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          <div class="overflow-x-auto max-h-60" v-bind:class = "(dataLoaded)?'':'hidden'">
              <table class="table w-full">
                  <!-- head -->
                  <thead class="sticky top-0">
                  <tr class="text-primary">
                      <th></th>
                      <th>Name*</th>
                      <th>First Name</th>
                      <th>Initial</th>
                      <th>Last Name*</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="(item, index) in transformedData" :key="index">
                      <td class="text-primary font-semibold">{{this.makeTwoDigits(index + 1)}}</td>
                      <td>{{item['title']}}</td>
                      <td v-bind:class = "(item['first_name'] === null)?'text-orange-600':''">{{ item['first_name'] === null ? 'NULL' : item['first_name'] }}</td>
                      <td v-bind:class = "(item['initial'] === null)?'text-orange-600':''">{{ item['initial'] === null ? 'NULL' : item['initial'] }}</td>
                      <td>{{item['last_name']}}</td>
                  </tr>
                  </tbody>
              </table>
          </div>
      </div>
  </div>
</template>

<style scoped>
.header {
    font-family: 'Pacifico', cursive;
}
</style>

<script>

import {Person} from "@/dataModels/Person";

export default {
    data() {
        return {
            //map to store data
            //key: string
            //value: Person[]
            //a map is being used to track the initial input to the transformations
            data: new Map(),
            //array to store the transformed data
            transformedData: [],
            //loading
            loading: false,
            //is data loaded
            dataLoaded: false,
        }
    },
    methods: {
        /**
         * Function to handle file selection
         * @param event
         */
        handleFileSelection(event) {
            const _self = this;
            event.preventDefault();
            const input = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const text = e.target.result;
                if (typeof text === "string") {
                  //remove line breaks
                  const textWithoutLineBreaks = _self.formatText(text);
                  //split by comma
                  let arr = textWithoutLineBreaks.split(",");
                  //remove header
                  arr.shift();
                  _self.processData(arr);
                }
            };
            //get extension of file
            const extension = input.name.split(".").pop();
            //check if extension is csv
            if (extension === "csv") {
                this.loading = true;
                this.data.clear();
                reader.readAsText(input);
            } else {
                alert("Only .csv file are allowed");
            }
        },
        /**
         * Function to remove line breaks
         * @param text : string
         * @returns {string}
         */
        formatText(text) {
            let str = text.replace(/\r/g, "");
            str = str.replace(/\n/g, "");
            return str;
        },
        /**
         * Function to process the data
         */
        processData(arr) {
            arr.map((item) => {
                //split item by space
                const itemSplitBySpace = item.split(" ")
                //check if item length is less than 3
                if (itemSplitBySpace.length === 3) {
                    //title
                    const title = itemSplitBySpace[0];
                    //last name
                    const last_name = itemSplitBySpace[itemSplitBySpace.length - 1];
                    //initial or first name
                    let initial = null;
                    let firstName = null;
                    const middleValueIndex = itemSplitBySpace.length - 2;
                    const middleValue = itemSplitBySpace[middleValueIndex];
                    //remove special characters
                    const middleValueWithoutSpecialCharacters = middleValue.replace(/[^a-zA-Z ]/g, "");
                    if (middleValueWithoutSpecialCharacters.length === 1) {
                        initial = middleValue;
                    } else {
                        firstName = middleValue;
                    }
                    //create array of custom object
                    const obj = this.createObject(title, firstName, initial, last_name);
                    //set data to map
                    this.data.set(item, [obj]);
                } else if (itemSplitBySpace.length === 4 && item.includes("and")) {
                    //split by and
                    const itemSplitByAnd = item.split(" and ");
                    //title
                    let title = itemSplitByAnd[0].trim();
                    //last name
                    const lastName = itemSplitByAnd[itemSplitByAnd.length - 1].trim().split(" ")[1].trim();
                    //initial or first name
                    const initial = null;
                    const firstName = null;
                    //create array of custom object
                    let obj = this.createObject(title, firstName, initial, lastName);
                    //array of object
                    const arrObj = [];
                    arrObj.push(obj);
                    //title
                    title = itemSplitByAnd[1].trim().split(" ")[0].trim();
                    //create object
                    obj = this.createObject(title, firstName, initial, lastName);
                    //add to array
                    arrObj.push(obj);
                    //set data to map
                    this.data.set(item, arrObj);
                } else if (itemSplitBySpace.length > 4 && item.includes("and")) {
                    //split by and
                    const itemSplitByAnd = item.split(" and ");
                    //array of object
                    const arrObj = [];
                    //loop through array
                    itemSplitByAnd.map((names) => {
                        //split by space
                        const itemSplitBySpace = names.split(" ");
                        //title
                        const title = itemSplitBySpace[0];
                        //last name
                        const lastName = itemSplitBySpace[itemSplitBySpace.length - 1];
                        //initial or first name
                        let initial = null;
                        let firstName = null;
                        const middleValueIndex = itemSplitBySpace.length - 2;
                        const middleValue = itemSplitBySpace[middleValueIndex];
                        if (middleValue.length === 1) {
                            initial = middleValue;
                        } else {
                            firstName = middleValue;
                        }
                        //create array of custom object
                        const obj = this.createObject(title, firstName, initial, lastName);
                        //add to array
                        arrObj.push(obj);
                    });
                    //set data to map
                    this.data.set(item, arrObj);
                } else {
                    if (item.includes("&")) {
                        //split by space
                        const itemSplitBySpace = item.split(" ");
                        //title
                        //combine first 3 values in array into a string
                        const title = itemSplitBySpace[0] + " " + itemSplitBySpace[1] + " " + itemSplitBySpace[2];
                        //last name
                        const lastName = itemSplitBySpace[itemSplitBySpace.length - 1];
                        //initial or first name
                        let initial = null;
                        let firstName = null;
                        const middleValueIndex = itemSplitBySpace.length - 2;
                        const middleValue = itemSplitBySpace[middleValueIndex];
                        //remove special characters
                        const middleValueWithoutSpecialCharacters = middleValue.replace(/[^a-zA-Z ]/g, "");
                        //check if middle value is a initial or first name
                        if (middleValueWithoutSpecialCharacters.length === 1) {
                            initial = middleValue;
                        } else {
                            firstName = middleValue;
                        }
                        //create array of custom object
                        const obj = this.createObject(title, firstName, initial, lastName);
                        //set data to map
                        this.data.set(item, [obj]);
                    }
                }
            });
            const arrays =  this.extractArraysFromMap();
            this.transformedData = arrays;
            console.log(this.data);
            console.log(arrays);
            this.loading = false;
            this.dataLoaded = true;
        },
        /**
         * Function to creat a object and return it
         */
        createObject(title, firstName, initial, lastName) {
            return new Person(title, firstName, initial, lastName);
        },
        /**
         * Function to extract arrays from a map of arrays
         * @returns {[]}
         *
         * The function loops through the map and extract the arrays
         * and convert the array to type Person
         * and return the array
         */
        extractArraysFromMap() {
            const arr = [];
            this.data.forEach((value) => {
                value.map((item) => {
                    //extract target from proxies
                    item = Object.assign({}, item);
                    //convert item to type Person
                    item = new Person(item.title, item.first_name, item.initial, item.last_name);
                    arr.push(item);
                });
            });
            return arr;
        },
        /**
         * Function to make a number two digits if it is not
         */
        makeTwoDigits(number) {
            if (number < 10) {
                return "0" + number;
            } else {
                return number;
            }
        }
    }
}
</script>
