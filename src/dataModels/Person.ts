export class Person {
    private title: string;
    private first_name: string;
    private initial: string;
    private last_name: string;
    constructor(title : string, first_name : string, initial : string, last_name: string) {
        this.title = title;
        this.first_name = first_name;
        this.initial = initial;
        this.last_name = last_name;
    }
}