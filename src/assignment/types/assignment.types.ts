import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Lesson } from 'src/lesson/types/lesson.types';
import { Result } from 'src/result/types/result.types';
import { Teacher } from 'src/teacher/types/teacher.types';
import { Subject } from 'src/subject/types/subject.types';
import { Class } from 'src/class/types/class.types';
import { Submission } from 'src/submission/types/submission.types';

@ObjectType()
export class Assignment {
  @Field(() => Int)
  id: number;

  @Field()
  title: string;

  @Field()
  startDate: Date;

  @Field()
  dueDate: Date;

  @Field(() => Int)
  lessonId: number;

  @Field(() => Lesson)
  lesson: Lesson;

  @Field(() => [Result])
  results: Result[];

  @Field(() => String)
  teacherId: string;

  @Field(() => Teacher)
  teacher: Teacher;

  @Field(() => Int)
  subjectId: number;

  @Field(() => Subject)
  subject: Subject;

  @Field(() => Int)
  classId: number;

  @Field(() => Class)
  class: Class;

  @Field(() => [Submission])
  submissions: Submission[];

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
