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
    this.configure();
    this.attach();
  }

  private submitHandler(e: Event): void {
    e.preventDefault();
    console.log(this.title.value);
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
