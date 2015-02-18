/*
The MIT License (MIT)
Copyright (c) 2015 Franco Cavestri
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.
*/

var Trivia = {};

Trivia.Game = function () {
  this.key = "<your-api>";
  this.tmdb = theMovieDb;
  this.movies = [];
  this.image_size = "w500";
  this.current_title = [];
  this.shuffled_title = [];
  this.movie = {};
  this.stage = 0;
  this.retry = 3;
  this.years = [];
};

Trivia.Game.prototype = {
  init: function () {
    this.tmdb.common.api_key = this.key;
    for (var i = 2016 - 1; i >= 1990; i--) {
      this.years.push(i);
    };
    this.shuffle(this.years);
    var next = document.getElementById("next");
    next.addEventListener("click", function (e) { this.updateStage(e); }.bind(this), false);
    this.getMovies();
  },
  error: function (data) {
    document.getElementById("error").setAttribute("class", "show");
    console.log(data);
  },
  getMovies: function () {
    var year = this.years.pop();
    this.tmdb.discover.getMovies({year: year}, function (data) {
      data = JSON.parse(data);
      if(data.hasOwnProperty("results") && data.results.length > 0) {
        for (var i = data.results.length - 1; i >= 0; i--) {
            if(data.results[i]["title"].length < 15 && data.results[i]["backdrop_path"] != "") {
              var item = { title: "", img: ""};
              item.title = data.results[i]["title"].toUpperCase().split("");
              item.img = data.results[i]["backdrop_path"];
              this.movies.push(item);
            }
        };
        this.updateStage();
      } else {
        this.error("No Data");
      }
    }.bind(this), this.error);
  },
  getMoviesSuccess: function (data) {
    this.movies = data;
    this.updateStage();
  },
  getImage: function (src) {
    return this.tmdb.common.getImage({size: this.image_size, file: src});
  },
  updateImage: function (src) {
    document.getElementById("poster").setAttribute("src", src);
  },
  updateStage: function () {
    this.resetStage();
    if(this.movies.length > 0) {
      this.stage = this.stage + 1;
      this.movie = this.movies.shift();
      this.updateImage(this.getImage(this.movie.img));
      this.createLetters();
    } else {
      this.movies = [];
      this.getMovies();
    }
  },
  createLetters: function () {
    this.shuffled_title = this.movie.title.slice(0);
    this.shuffled_title = this.shuffle(this.shuffled_title);
    for (var i = this.shuffled_title.length - 1; i >= 0; i--) {
      var node = document.createElement("li");
      var text = document.createTextNode(this.shuffled_title[i]);
      node.setAttribute("id", "letter-" + i);
      node.addEventListener("click", function (e) { this.selectLetter(e); }.bind(this), false);
      node.appendChild(text);
      document.getElementById("letters_list").appendChild(node);
    };
  },
  shuffle: function (o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
  },
  selectLetter: function (letter) {
    document.getElementById(letter.target.id).setAttribute("class", "hide");
    this.updateResult(letter.target.id, letter.target.innerText);
  },
  updateResult: function (id, text) {
      var node = document.createElement("li");
      var textNode = document.createTextNode(text);
      node.setAttribute("id", "result-" + id);
      node.addEventListener("click", function (e) { this.undoLetter(e); }.bind(this), false);
      node.appendChild(textNode);
      document.getElementById("result_list").appendChild(node);
      this.current_title.push(text);
      this.checkResult();
  },
  undoLetter: function (letter) {
    this.current_title.pop();
    var node = document.getElementById(letter.target.id);
    node.parentNode.removeChild(node);
    document.getElementById(letter.target.id.replace("result-","")).setAttribute("class", "show");
  },
  checkResult: function () {
    var next = document.getElementById("next");
    if(this.compareArrays(this.current_title, this.movie.title)) {
      next.setAttribute("class", "show");
      document.getElementById("success").setAttribute("class", "show");
    } else {
      next.setAttribute("class", "hide");
    }
  },
  compareArrays: function (a, b) {
    if (a.length != b.length)
        return false;

    for (var i = 0, l=a.length; i < l; i++) {
      if (a[i] != b[i])
        return false;
    }
    return true;
  },
  clearList: function (node) {
    while (node.firstChild) {
     node.removeChild(node.firstChild);
    }
  },
  resetStage: function () {
    this.current_title = [];
    this.shuffled_title = [];
    document.getElementById("next").setAttribute("class", "hide");
    var results = document.getElementById("result_list");
    this.clearList(results);
    var letters = document.getElementById("letters_list");
    this.clearList(letters);
    document.getElementById("loader").setAttribute("class", "hide");
    document.getElementById("success").setAttribute("class", "hide");
    document.getElementById("error").setAttribute("class", "hide");
    this.movie = {};
  }
};

var game = new Trivia.Game();
game.init();