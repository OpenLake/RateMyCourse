const mongoose = require("mongoose");
const { Course, Iteration } = require("../models/course.model");
const { Instructor } = require("../models/instructor.model");

const addCourse = async (req, res) => {
  try {
    const userCourseData = {
      ccode: req.body.ccode,
      cname: req.body.cname,
      ccredits: req.body.ccredits,
      cdept: req.body.cdept,
      crating: 0,
      ccount: 0,
    };

    let course = await Course.findOne({ ccode: userCourseData.ccode });
    if (!course) {
      const newCourse = new Course(userCourseData);
      course = await newCourse.save();
      console.log("Course created:", course);
      res.status(200).json({ message: "Course added successfully." });
    } else {
      console.log("Course already exists!");
      res.status(200).json({ message: "Course already exists!" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const addReview = async (req, res) => {
  try {
    const userIterationData = {
      ccode: req.body.ccode,
      instructorName: req.body.instructorName,
      courseRating: req.body.courseRating,
      semesterOffered: req.body.semesterOffered,
    };

    let iteration = await Iteration.findOne({
      ccode: userIterationData.ccode,
      semesterOffered: userIterationData.semesterOffered,
    });

    if (!iteration) {
      const newIteration = new Iteration({
        ccode: userIterationData.ccode,
        instructorName: userIterationData.instructorName,
        courseRating: userIterationData.courseRating,
        semesterOffered: userIterationData.semesterOffered,
        ratingsCount: 1,
      });

      iteration = await newIteration.save();
      console.log("Iteration created:", iteration);
    } else {
      iteration.ratingsCount += 1;
      iteration.courseRating =
        (iteration.courseRating * (iteration.ratingsCount - 1) +
          userIterationData.courseRating) /
        iteration.ratingsCount;
      await iteration.save();
      console.log("Iteration updated:", iteration);
    }
    
    let course=await Course.findOne({
      ccode: userIterationData.ccode,
    })

    let ogRating=course.crating;
    let ogCount=course.ccount;
    // console.log("The old course count is", ogCount);
    course.ccount+=1;
    // console.log("The new course count is", course.ccount);
    // console.log("The old course rating is", ogRating);
    course.crating=((ogRating*ogCount)+userIterationData.courseRating)/(course.ccount);
    // console.log("The new course rating is",course.crating);
    await course.save();
    console.log("Overall Course Rating Updated.")

    const userInstructorName = userIterationData.instructorName;

    let instructExists = await Instructor.findOne({
      instructorName: userInstructorName,
    });

    if (instructExists) {
      instructExists.instructRatingCount += 1;

      instructExists.instructRating =
        (instructExists.instructRating *
          (instructExists.instructRatingCount - 1) +
          userIterationData.courseRating) /
        instructExists.instructRatingCount;
      await instructExists.save();
    } else {
      const newInstructor = new Instructor({
        instructorName: userIterationData.instructorName,
        instructRating: userIterationData.courseRating,
        instructRatingCount: 1,
      });

      const createInstructor = await newInstructor.save();
      console.log("Instructor Created");
    }

    res
      .status(200)
      .json({ message: "Iteration Rating added/updated successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    if (!courses) {
      return res.status(404).json({ message: "No courses found" });
    } else {
      // console.log();
      return res.json({ courses });
    }
  } catch (error) {
    console.log(error);
  }
};

const getIterations = async (req, res) => {
  try {
    const courseCode = req.body.ccode;
    const courseReviews = await Iteration.find({ ccode: courseCode });

    return res.json({ courseReviews });
  } catch (error) {
    console.log(error);
  }
};

const getInstructors = async (req, res) => {
  try {
    const allInstructors = await Instructor.find({});
    return res.json({ allInstructors });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  addCourse,
  addReview,
  getCourses,
  getIterations,
  getInstructors,
};
