// inisiasi
const express = require('express')
const app = express()
const port = 5000
const path = require ("path")
const favicon = require('serve-favicon')
const config = require("./config/config.json")
const {Sequelize, QueryTypes} = require("sequelize")
const sequelize = new Sequelize(config.development)
const blogModel = require("./models").article;
const userModel = require("./models").user
const bcrypt = require("bcrypt")
const session = require("express-session")
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now();
    cb(null, new Date().getTime() + '-' + file.originalname);
  },
});

const fileFilter = (req,file,cb) => {
  if(
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ){
    cb(null,true);
  } else{
    cb(null,true);
  }
}

const upload = multer({ storage: fileStorage, fileFilter: fileFilter });


// app & middleware settings
app.set('view engine', 'hbs');
app.set("views", path.join(__dirname, "./views"));
app.use("/assets", express.static(path.join(__dirname,"./assets")));
app.use(favicon(__dirname + '/assets/IMG/favicon.ico'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  name:"Mysession",
  secret:"confidential",
  resave:false,
  saveUninitialized:true,
  cookie:{
      secure:false,
      maxAge:1000 * 60 * 60 *  24
  },
}));
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));


// routing
app.get("/", home);
app.get("/project", isLoggedIn, project);
app.post("/project", upload.single("image"), addProject);
app.get("/edit/:id", isLoggedIn, editView);
app.post("/edited", upload.single("image"), edited);
app.post("/delete/:id", deletePost);
app.get("/bigproject/:id", detailProject);
app.get("/login", redirectHomeIfLoggedIn, login);
app.post("/signIn", signIn);
app.post("/register", register);
app.get("/logout", logOut)



// function
function isLoggedIn(req, res, next) {
  if (!req.session || !req.session.login) {
    return res.redirect('/login'); 
  }
  next(); 
}

function redirectHomeIfLoggedIn(req, res, next) {
  if (req.session && req.session.login) {
    return res.redirect('/'); 
  }
  next(); 
}

async function home(req,res){
  const query ="SELECT * FROM articles ORDER BY updated_at DESC";
  const data = await sequelize.query(query, { type: QueryTypes.SELECT });

  const login = req.session.login
  const user = req.session.user

  res.render('index', {data, login, user});
}

function project(req,res){
  const login = req.session.login
  const user = req.session.user

  res.render('project', {login, user})
}

async function addProject(req, res){
  const { title, content, startdate, enddate, node, react, javaScript, vue } = req.body;
  const file = req.file;

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

  const query = `
    INSERT INTO articles (title, content, "startdate", "enddate", node, react, javascript, vue, image, duration,"created_at","updated_at")
    VALUES ('${title}', '${content}', '${startDate.toISOString()}', '${endDate.toISOString()}', ${node ? 'TRUE' : 'FALSE'}, ${react ? 'TRUE' : 'FALSE'}, ${javaScript ? 'TRUE' : 'FALSE'}, ${vue ? 'TRUE' : 'FALSE'}, '${file.filename}', '${duration}', now(), now())
  `;
  const data = await sequelize.query(query, { type: QueryTypes.INSERT });
  
  
  
  res.redirect('/#project');
}

async function editView(req,res){
  const {id} = req.params;
    const selectedData = await blogModel.findOne({
        where: { id },
        attributes: [
          'id',
          'title',
          'content',
          'startdate',
          'enddate',
          'vue',
          'react',
          'node',
          'javascript',
          'image',
          'duration',
          'created_at',
          'updated_at', 
        ],
      });

      const login = req.session.login
      const user = req.session.user

  res.render('editblog', {data:selectedData ,login, user})
}

async function edited(req,res){
  const { id, title, content, startdate, enddate, node, react, javaScript, vue} = req.body;
  const image = req.file.filename;


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

  const now = new Date(); 

  const query  = `
  UPDATE public.articles
  SET title=:title, content=:content, startdate=:startdate, enddate=:enddate,
      node=:node, react=:react, javaScript=:javaScript, vue=:vue, duration=:duration, created_at=:created_at, updated_at=:updated_at, image=:image
  WHERE id=:id`;
  const data = await sequelize.query(query, {
    replacements: {
      id,
      title,
      content,
      startdate: startDate.toISOString(),
      enddate: endDate.toISOString(),
      node: node ? 'TRUE' : 'FALSE',
      react: react ? 'TRUE' : 'FALSE',
      javaScript: javaScript ? 'TRUE' : 'FALSE',
      vue: vue ? 'TRUE' : 'FALSE',
      duration,
      created_at: now,
      updated_at: now,
      image
    },
    type: QueryTypes.UPDATE
  });
   
  
  req.session.login = true; 

  res.redirect('/#project')
}

async function deletePost(req,res){
  const {id} = req.params; 
    const query = `DELETE FROM articles WHERE id=${id}`;
    const data = await sequelize.query(query, { type: QueryTypes.DELETE });


  res.redirect('/#project')
}

async function detailProject(req,res){
  const {id} = req.params;

    const query =`SELECT * FROM articles WHERE id=${id}`;
    const data = await sequelize.query(query, { type: QueryTypes.SELECT });

    const login = req.session.login
  const user = req.session.user

  res.render('bigproject', {data:data[0], login, user})
}

function login(req,res){
  res.render('login')
}

async function signIn(req,res){
  const { user, pass } = req.body;

    const userData = await userModel.findOne({
      where: { username:user },
    });
  
    if (!userData) return res.redirect("/");

    const passValid = await bcrypt.compare(pass, userData.password);

    if (!passValid) return res.redirect("/");

    req.session.login = true;
    req.session.user = {
      username: userData.username,
      email: userData.email,
    };


    res.redirect("/"); 

}

async function register(req,res){
  const{username,email,password}=req.body

  const salt = 10;
  const hashedPassword = await bcrypt.hash(password, salt);

  const query = `INSERT INTO users (username,email,password) VALUES('${username}','${email}','${hashedPassword}')`;
  const data = await sequelize.query(query, { type: QueryTypes.INSERT });

  res.redirect("login")
}

async function logOut(req, res) {
  req.session.destroy(function (err) {
    if (err) return console.error("FAILED!!");

    res.redirect("/");
  });
}





app.listen (port,()=>{
  console.log("server is running on port:" , port);
});