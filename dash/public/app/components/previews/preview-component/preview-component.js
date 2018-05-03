class PreviewComponent {
  constructor() {

  }

  getNotHidden() {
    return _.filter(this.translation.data || [], item => !item.hidden);
  }

  notHiddenCount() {
    return _.filter(this.translation.data || [], item => !item.hidden).length;
  }
}
