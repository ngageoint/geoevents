# This technical data was produced for the U. S. Government under Contract No. W15P7T-13-C-F600, and
# is subject to the Rights in Technical Data-Noncommercial Items clause at DFARS 252.227-7013 (FEB 2012)

from django.contrib.gis import admin
from geoevents.feedback.models import Feedback, Article, Category, SubjectEmailMap
from datetime import datetime


class FeedbackAdmin(admin.ModelAdmin):
    pass


class ArticleAdmin(admin.ModelAdmin):
    exclude = ['slug']
    list_display = ['title', 'category', 'common_issue', 'created']
    search_fields = ['title', ]


class CategoryAdmin(admin.ModelAdmin):
    pass


class SubjectEmailMapAdmin(admin.ModelAdmin):
    list_display = ['subject', 'emails', ]


admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Article, ArticleAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(SubjectEmailMap, SubjectEmailMapAdmin)