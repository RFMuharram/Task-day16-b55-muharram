// inisiasi
const express = require('express')
const app = express()
const port = 5000
const path = require ("path")
const favicon = require('serve-favicon')

// app & middleware settings
app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, "./views"));
app.use("/assets", express.static(path.join(__dirname,"./assets")));
app.use(favicon(__dirname + '/assets/IMG/favicon.ico'));
app.use(express.urlencoded({ extended: false }));


// routing
app.get("/", home);
app.get("/project", project);
app.post("/project", addProject);
app.get("/edit/:id",editView);
app.post("/edited", edited);
app.post("/delete/:id", deletePost);
app.get("/bigproject/:id", detailProject);
app.get("/login", login);


const data = []


// function
function home(req,res){
  res.render('index', {data : data})
}

function project(req,res){
  res.render('project')
}

function addProject(req, res){
  const { title, content, startdate, enddate, node, react, javaScript, vue} = req.body;

  const startDate = new Date(startdate);
  const endDate = new Date(enddate);
  const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());

  const timeDifferenceDay = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const timeDifferenceWeek = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
  const timeDifferenceMonth = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30.44));
  const timeDifferenceYear = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

  let duration = '';
  if (timeDifferenceYear > 0) {
    duration = `${timeDifferenceYear} Year`;
  } else if (timeDifferenceMonth > 0) {
    duration = `${timeDifferenceMonth} Month`;
  } else if (timeDifferenceWeek > 0) {
    duration = `${timeDifferenceWeek} Week`;
  } else if (timeDifferenceDay > 0) {
    duration = `${timeDifferenceDay} Day`;
  } 

  const dataBlog = {title,content,startdate,enddate,node,react,javaScript,vue,duration: duration}

  data.unshift(dataBlog);

  res.redirect('/#project');
}

function editView(req,res){
  const {id} = req.params;

  const selectedData = data[id];
  selectedData.id = id
  res.render('editblog', {data : selectedData})
}

function edited(req,res){
  const { id, title, content, startdate, enddate, node, react, javaScript, vue} = req.body;

  const startDate = new Date(startdate);
  const endDate = new Date(enddate);
  const timeDifference = Math.abs(endDate.getTime() - startDate.getTime());

  const timeDifferenceDay = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
  const timeDifferenceWeek = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
  const timeDifferenceMonth = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 30.44));
  const timeDifferenceYear = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));

  let duration = '';
  if (timeDifferenceYear > 0) {
    duration = `${timeDifferenceYear} Year`;
  } else if (timeDifferenceMonth > 0) {
    duration = `${timeDifferenceMonth} Month`;
  } else if (timeDifferenceWeek > 0) {
    duration = `${timeDifferenceWeek} Week`;
  } else if (timeDifferenceDay > 0) {
    duration = `${timeDifferenceDay} Day`;
  } 

  data[id] = {
    title,
    content,
    startdate,
    enddate,
    node,
    react,
    javaScript,
    vue,
    duration: duration 
}

  res.redirect('/#project')
}

function deletePost(req,res){
  const {id} = req.params; 
  data.splice(id,1)

  res.redirect('/#project')
}

function detailProject(req,res){
  const { id } = req.params;

  const detail = data[id]

  res.render('bigproject', { detail })
}

function login(req,res){
  res.render('login')
}





app.listen (port,()=>{
  console.log("server is running on port:" , port);
});