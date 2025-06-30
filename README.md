BOOK REVIEWS

This ia a webiste that allows user to write review about a particular book and automatically genarate a book cover from the name and book title they entered.

This is done using an api from open library and i used an alternate api which is google book api, so if it doesn't find a particular book cover in open library, it will check google book api also.

I'm using postgres as my database, I'm using pgAdmin tools to create my database and connect to my website.
I have six column: id, author, title, ratings, review and date. 

Stack used are:
    EJS
    HTML
    JAVACRIPT
    EXPRESS.JS
    NODE.JS
    VANILLA CSS

I made sure i carried out all the CRUD actions.
You can create, read, update, and delete a review if you want to.

I also have an error handling messsage, if there's error, you will know where thers's problem.


To get started:
run npm install to install all available dependecies
then run node index.js to start the sever
