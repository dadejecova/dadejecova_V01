from django.core.management.base import BaseCommand
from projects.models import Topic, Series, Lesson, LessonType
import random

class Command(BaseCommand):
    help = 'Seeds the database with initial topics, series, and lessons'

    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting old data...')
        Lesson.objects.all().delete()
        Series.objects.all().delete()
        Topic.objects.all().delete()
        LessonType.objects.all().delete()

        self.stdout.write('Creating Lesson Types...')
        lt_tutorial = LessonType.objects.create(name='Tutorial', slug='tutorial')
        lt_article = LessonType.objects.create(name='Article', slug='article')

        self.stdout.write('Creating Topics...')
        topics = []
        for i in range(1, 4):
            topic = Topic.objects.create(
                name=f'Topic {i}',
                slug=f'topic-{i}',
                description=f'This is a description for topic {i}.'
            )
            topics.append(topic)

        self.stdout.write('Creating Series...')
        all_series = []
        for index, topic in enumerate(topics):
            # 2 series per topic
            for j in range(1, 3):
                series = Series.objects.create(
                    topic=topic,
                    name=f'Series {j} of {topic.name}',
                    slug=f'series-{index+1}-{j}',
                    description=f'Description for series {j} of {topic.name}.'
                )
                all_series.append(series)
        
        self.stdout.write('Creating Lessons...')
        # 15 lessons total. We can distribute them in the 6 series.
        counts = [3, 2, 3, 2, 3, 2]
        
        for index, series in enumerate(all_series):
            num_lessons = counts[index]
            for l in range(1, num_lessons + 1):
                Lesson.objects.create(
                    topic=series.topic,
                    series=series,
                    lesson_type=random.choice([lt_tutorial, lt_article]),
                    title=f'Lesson {l} of {series.name}',
                    description=f'Learn about {series.name} part {l}.',
                    content=f'# Welcome to {series.name} Part {l}\n\nHere is the content in markdown.',
                    technology='Python'
                )
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data with 3 Topics, 6 Series, and 15 Lessons.'))
