var express = require('express');
var router = express.Router();
var userModel = require("./users");
var postModel = require("./posts");
var boardModel = require("./boards");
const passport = require('passport');
const localStrategy = require("passport-local");
const upload = require('./multer');

passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('login', { nav: false });
});

router.get('/login', function (req, res, next) {
  res.render('login', { nav: false });
});

router.get('/register', function (req, res, next) {
  res.render('register', { nav: false });
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
    .populate({
      path: 'boards',
      populate: { path: 'posts' }
    });
  res.render('profile', { user, nav: true });
});

router.get('/board/:boardId', isLoggedIn, async function (req, res, next) {
  const boardId = req.params.boardId;
  const board = await boardModel.findById(boardId).populate('posts');
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('show', { user, board, nav: true });
});

router.get('/add', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('boards');
  res.render('add', { user, nav: true });
});

router.get('/addBoard', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  res.render('addBoard', { user, nav: true });
});

router.post('/createBoard', isLoggedIn, upload.single("postImage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user })
  const board = await boardModel.create({
    user: user._id,
    title: req.body.title
  })
  user.boards.push(board._id);
  await user.save(); // Assuming board is a mongoose model
  res.redirect('profile');
});

router.get('/feed', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('boards');
  const posts = await postModel.find().populate("user");
  res.render('feed', { user, posts, nav: true });
});

router.post('/createpost', isLoggedIn, upload.single("postImage"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user }).populate('boards');
  const post = await postModel.create({
    user: user._id,
    board: req.body.board,
    postImage: req.file.filename,
    title: req.body.title,
    description: req.body.description,
  })
  console.log(post)
  const board = user.boards.find(board => board._id.equals(req.body.board));
  if (board) {
    board.posts.push(post._id);
    await board.save(); // Assuming board is a mongoose model
  }
  res.redirect('profile');
});

router.post('/fileupload', isLoggedIn, upload.single("image"), async function (req, res, next) {
  const user = await userModel.findOne({ username: req.session.passport.user });
  user.profileImage = req.file.filename;
  await user.save();
  res.redirect("/profile");
});

router.post('/register', function (req, res, next) {
  const data = new userModel({
    fullName: req.body.fullName,
    username: req.body.username,
    email: req.body.email,
    contact: req.body.contact,
  });

  userModel.register(data, req.body.password)
    .then(async function (user) {
      req.login(user, async function (err) {
        if (err) {
          console.error("Error authenticating user:", err);
          return next(err);
        }

        // Create a default board for the user
        const defaultBoard = await boardModel.create({
          user: user._id,
          title: "My Posts"
        });

        // Add the default board to the user's boards
        user.boards.push(defaultBoard._id);
        await user.save();

        // Redirect to profile page
        res.redirect("/profile");
      });
    })
    .catch(function (err) {
      // Handle registration errors
      console.error("Error registering user:", err);
      res.redirect("/register");
    });
});

router.post('/login', passport.authenticate("local", {
  failureRedirect: "/",
  successRedirect: "/profile"
}), function (req, res, next) {

});

router.get("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  })
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

module.exports = router;
