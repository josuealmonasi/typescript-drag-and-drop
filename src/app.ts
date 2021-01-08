/* Validation Interface*/
interface Validatable {
  value: string | number;
  required?: boolean /* Using "| undefined" works as well instead of question mark */;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

/* Validation decorator */
const Validate = (validatableInput: Validatable) => {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }

  /* "!= null"checks for null and undefined */
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === 'string'
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === 'number'
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  return isValid;
};

/* Autobind decorator */
/* A decorator funciton takes target, methodName, descriptor */
const AutoBind = (_: any, __: string, descriptior: PropertyDescriptor) => {
  const originalMethod = descriptior.value;
  const adjustedDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      const fn = originalMethod.bind(this);
      return fn;
    },
  };
  return adjustedDescriptor;
};

type Listener = (items: Project[]) => void;

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static _instance: ProjectState;

  private constructor() {}

  static getInstance(): ProjectState {
    if (this._instance) {
      return this._instance;
    }
    this._instance = new ProjectState();
    return this._instance;
  }

  /* Adds listener function */
  addListener(listenerFunction: Listener): void {
    this.listeners.push(listenerFunction);
  }

  addProject(title: string, description: string, numOfPeople: number): void {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active,
    );
    this.projects.push(newProject);
    for (const fn of this.listeners) {
      fn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

/* ProjectList Class */
class ProjectList {
  templanteEl: HTMLTemplateElement;
  rootEl: HTMLDivElement;
  el: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: 'active' | 'finished') {
    this.assignedProjects = [];
    this.templanteEl = document.querySelector(
      '#project-list',
    ) as HTMLTemplateElement;
    this.rootEl = document.querySelector('#app') as HTMLDivElement;
    const importNode = document.importNode(this.templanteEl.content, true);
    this.el = importNode.firstElementChild as HTMLElement;
    this.el.id = `${this.type}-projects`;
    projectState.addListener((proj: Project[]) => {
      this.assignedProjects = proj;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  /* Render Projects */
  private renderProjects(): void {
    const listEl = document.getElementById(
      `${this.type}-projects-list`,
    )! as HTMLUListElement;
    for (const proj of this.assignedProjects) {
      const listItem = document.createElement('li');
      listItem.textContent = proj.title;
      listEl.appendChild(listItem);
    }
  }

  /* Rendering items on a list */
  private renderContent(): void {
    const listId = `${this.type}-projects-list`;
    this.el.querySelector('ul')!.id = listId;
    this.el.querySelector('h2')!.textContent =
      this.type.toUpperCase() + ' PROJECTS';
  }

  /* Attaching form element to root element */
  private attach(): void {
    this.rootEl.insertAdjacentElement('beforeend', this.el);
  }
}

/* ProjectInput Class */
class ProjectInput {
  templanteEl: HTMLTemplateElement;
  rootEl: HTMLDivElement;
  el: HTMLFormElement;
  title: HTMLInputElement;
  description: HTMLInputElement;
  people: HTMLInputElement;

  /* Inits elements in template */
  constructor() {
    this.templanteEl = document.querySelector(
      '#project-input',
    ) as HTMLTemplateElement;
    this.rootEl = document.querySelector('#app') as HTMLDivElement;
    const importNode = document.importNode(this.templanteEl.content, true);
    this.el = importNode.firstElementChild as HTMLFormElement;
    this.el.id = 'user-input';

    /* Connecting HTML elements to class properties */
    this.title = this.el.querySelector('#title') as HTMLInputElement;
    this.description = this.el.querySelector(
      '#description',
    ) as HTMLInputElement;
    this.people = this.el.querySelector('#people') as HTMLInputElement;
    /* -------------------------------------------- */
    this.configure();
    this.attach();
  }

  @AutoBind
  private submitHandler(e: Event): void {
    e.preventDefault();
    const userInput = this.getUserInputs();
    if (Array.isArray(userInput)) {
      console.log(userInput);
      const [title, desc, people] = userInput;
      projectState.addProject(title, desc, people);
    }
    this.clearInputs();
  }

  private getUserInputs(): [string, string, number] | void {
    const title: Validatable = {
      value: this.title.value,
      required: true,
      minLength: 4,
    };
    const description: Validatable = {
      value: this.description.value,
      required: true,
      minLength: 4,
    };
    const people: Validatable = {
      value: +this.people.value,
      required: true,
      min: 1,
      max: 5,
    };

    if (!Validate(title) || !Validate(description) || !Validate(people)) {
      alert('Invalid input');
      return;
    } else {
      return [
        title.value.toString(),
        this.description.value,
        +this.people.value,
      ];
    }
  }

  private clearInputs(): void {
    this.title.value = '';
    this.description.value = '';
    this.people.value = '';
  }

  /* Decorator ensures auto binding and avoids 'this.submitHandler.bind(this)' */
  @AutoBind
  private configure(): void {
    this.el.addEventListener('submit', this.submitHandler);
  }

  /* Attaching form element to root element */
  private attach(): void {
    this.rootEl.insertAdjacentElement('afterbegin', this.el);
  }
}

const i1 = new ProjectInput();
const activeProjectList = new ProjectList('active');
const finishedProjectList = new ProjectList('finished');
