class PreviewComponent {
  constructor() {

  }

  getNotHidden() {
    return _.filter(this.choices || [], item => !item.hidden);
  }

  notHiddenCount() {
    return _.filter(this.choices || [], item => !item.hidden).length;
  }
}
