
import { Router } from "express";
import { Course } from "../models/course.js";

class CourseService {
  async createCourse(courseData: any): Promise<any> {
    const newCourse = new Course(courseData);
    return await newCourse.save();
  }

  async updateCourse(courseId: string, courseData: any): Promise<any> {
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      courseData,
      { new: true }
    );
    if (!updatedCourse) {
      throw new Error("Course not found");
    }
    return updatedCourse;
  }

  async deleteCourse(courseId: string): Promise<void> {
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      throw new Error("Course not found");
    }
  }

  async getCourses(): Promise<any[]> {
    return await Course.find();
  }
}

export default CourseService;