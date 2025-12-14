# subjects.py

from .observer import Subject

class PollSubject(Subject):
    def __init__(self, poll_instance):
        super().__init__()
        self.poll = poll_instance

    @property
    def channel(self):
        return self.poll.channel

    @property
    def id(self):
        return self.poll.id
