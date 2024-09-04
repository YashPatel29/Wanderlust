const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  let allListings = await Listing.find();
  res.render("./listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  res.render("./listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url = req.file.path;
  let filename = req.file.filename;
  let { title, description, price, country, location } = req.body;
  const newListings = new Listing({
    title: title,
    description: description,
    image: { url, filename },
    price: price,
    country: country,
    location: location,
  });
  newListings.owner = req.user._id;
  await newListings.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    res.redirect("/listings");
  }
  let orgImageUrl = listing.image.url;
  orgImageUrl = orgImageUrl.replace("/upload", "/upload/w_250");
  res.render("./listings/edit.ejs", { listing, orgImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let { title, description, price, country, location } = req.body;

  let listing = await Listing.findByIdAndUpdate(id, {
    title: title,
    description: description,
    price: price,
    country: country,
    location: location,
  });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteListing = async (req, res) => {
  let { id } = req.params;
  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
