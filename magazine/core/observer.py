# observers.py

from abc import ABC, abstractmethod

# Observer – інтерфейс спостерігача
class Observer(ABC):
    @abstractmethod
    def update(self, subject, **kwargs):
        pass


# Subject – інтерфейс суб’єкта
class Subject(ABC):
    def __init__(self):
        self._observers = []

    def attach(self, observer: Observer):
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: Observer):
        if observer in self._observers:
            self._observers.remove(observer)

    def notify(self, **kwargs):
        for observer in self._observers:
            observer.update(self, **kwargs)




from ..articles.models import Notification

class NotificationObserver(Observer):
    def __init__(self, user):
        self.user = user

    def update(self, subject, **kwargs):
        Notification.objects.create(
            user=self.user,
            text=f"Нове опитування у каналі {subject.channel.name}",
            link=f"/polls/{subject.id}",
            channel_name=subject.channel.name
        )