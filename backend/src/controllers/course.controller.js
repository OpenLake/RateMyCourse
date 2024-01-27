const mongoose = require('mongoose');
const { Course, Iteration } = require('../models/course.model');

const addCourseReview = async (req, res) => {
  try {
    const userCourseData = {
      ccode: req.body.ccode,
      cname: req.body.cname,
      ccredits: req.body.ccredits,
      cdept: req.body.cdept,
    };

    const userIterationData = {
      ccode: req.body.ccode,
      instructorName: req.body.instructorName,
      courseRating: req.body.courseRating,
      semesterOffered: req.body.semesterOffered,
    };

    // Check if the course exists
    let course = await Course.findOne({ ccode: userCourseData.ccode });

    if (!course) {
      // If the course doesn't exist, create it
      const newCourse = new Course(userCourseData);
      course = await newCourse.save();
      console.log('Course created:', course);
    }

    // Check if the iteration with the given semesterOffered exists
    let iteration = await Iteration.findOne({
      ccode: userIterationData.ccode,
      semesterOffered: userIterationData.semesterOffered,
    });

    if (!iteration) {
      // If the iteration doesn't exist, create it
      const newIteration = new Iteration({
        ccode: userIterationData.ccode,
        instructorName: userIterationData.instructorName,
        courseRating: userIterationData.courseRating,
        semesterOffered: userIterationData.semesterOffered,
      });

      iteration = await newIteration.save();
      console.log('Iteration created:', iteration);
    } else {
      // If the iteration exists, update the courseRating
      iteration.courseRating =
        (iteration.courseRating + userIterationData.courseRating) / 2;
      await iteration.save();
      console.log('Iteration updated:', iteration);
    }

    res.status(200).json({ message: 'Course and Iteration added/updated successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  addCourseReview,
};
