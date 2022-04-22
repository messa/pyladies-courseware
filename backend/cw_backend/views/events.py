from ..courses.courses import Course
from ..model.task_solutions import TaskSolution
from ..model.users import User


class TaskSolutionUpdatedEvent:
    def __init__(self, course: Course, solved: bool, user: User, initiator: User,
                 solution: TaskSolution):
        self.course = course
        self.solved = solved
        self.user = user
        self.initiator = initiator
        self.solution = solution


class TaskSolutionCommentAddedEvent:
    def __init__(self, course: Course, comment: str, user: User, initiator: User,
                 solution: TaskSolution):
        self.course = course
        self.comment = comment
        self.user = user
        self.initiator = initiator
        self.solution = solution
