import { Field, ObjectType } from '@nestjs/graphql';
import { Lesson } from 'src/lesson/types/lesson.types';
import { Class } from 'src/class/types/class.types';
import { Subject } from 'src/subject/types/subject.types';
import { Teacher } from 'src/teacher/types/teacher.types';
import { Result } from 'src/result/types/result.types';

@ObjectType()
export class Exam {
  @Field(() => String)
  id: string;

  @Field()
  title: string;

  @Field()
  startTime: Date;

  @Field()
  endTime: Date;

  @Field(() => String)
  lessonId: string;

  @Field(() => Lesson)
  lesson: Lesson;

  @Field(() => String)
  classId: string;

  @Field(() => Class)
  class: Class;

  @Field(() => String)
  subjectId: string;

  @Field(() => Subject)
  subject: Subject;

  @Field(() => String)
  teacherId: string;

  @Field(() => Teacher)
  teacher: Teacher;

  @Field(() => [Result])
  results: Result[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
