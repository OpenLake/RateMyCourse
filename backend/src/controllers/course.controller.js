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

    let course = await Course.findOne({ ccode: userCourseData.ccode });

    if (!course) {
      const newCourse = new Course(userCourseData);
      course = await newCourse.save();
      console.log('Course created:', course);
    }

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
      console.log('Iteration created:', iteration);
    } else {
      iteration.ratingsCount += 1;
      iteration.courseRating = ((iteration.courseRating * (iteration.ratingsCount - 1)) + userIterationData.courseRating) / iteration.ratingsCount;
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
