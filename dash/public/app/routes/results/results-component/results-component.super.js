class ResultsComponent {
  constructor($scope, ResultsStore) {
    this._ResultsStore = ResultsStore;

    var activeFilter = this._ResultsStore.getQuestionFilter();

    this._filter = _.pick(activeFilter, ['devices', 'surveys', 'feedbacks']);
    if (this.compare === 'true') {
      this.question._isCompare = true;
      this._filter = _.assign(this._filter, activeFilter.compare);
    } else {
      this._filter = _.assign(this._filter, { from: activeFilter.from, to: activeFilter.to });
    }

    if (activeFilter.limitCount > 0) {
      this._filter = _.assign(this._filter, {
        limitCount: activeFilter.limitCount,
        limitPosition: activeFilter.limitPosition
      });
    }
  }

  getUnitSuffix() {
    return this.unit === 'normalized' ? '%' : '';
  }

  onAccuracyChange(accuracy) {
    this.accuracy = accuracy;
    this._updateAccuracyAndUnit();
  }

  onUnitChange(unit) {
    this.unit = unit;
    this._updateAccuracyAndUnit();
  }

  onChartTypeChange(chartType) {
    this.chartType = chartType;
    this._updateAccuracyAndUnit();
  }

  _updatePayload() {
    var update = _.assign(
      {},
      {
        question: _.omit(this.question, ['charts']),
        chart: this.activeChart,
        colorMap: this.colorMap || {},
        totals: this.totals,
        groupedTotals: _.get(this.question, 'totals.grouped') || {},
        totalUnitSuffix: this.getUnitSuffix()
      }
    );

    if (this.question.charts.pie !== undefined) {
      update = _.assign({}, update, { secondaryChart: this.question.charts.pie });
    }

    if (this.compare === 'true') {
      this._ResultsStore.updateQuestionPayload(this.question._id, { compare: update });
    } else {
      this._ResultsStore.updateQuestionPayload(this.question._id, _.assign(update, { compare: undefined }));
    }
  }

  _randomColorMap(names, colors) {
    var map = {};

    names.forEach((serieName, index) => {
      map[serieName.toString()] = colors[index % colors.length];
    });

    return map;
  }

  _initializeSettings() {
    this.unit = 'regular';
    this.accuracy = 'daily';

    if (this.question.question_type === 'NPS') {
      this.chartType = 'nps';
    }

    this._updateAccuracyAndUnit();
  }

  _updateAccuracyAndUnit() {
    this.totals = this.question.totals[this.unit];

    if (this.question.question_type !== 'NPS') {
      this.activeChart = _.assign({}, this.question.charts[this.accuracy || 'daily'][this.unit || 'regular']);
    } else if (this.chartType === 'bar') {
      this.activeChart = _.assign({}, this.question.charts[this.accuracy || 'daily'][this.unit || 'regular']);
    } else {
      this.activeChart = _.assign({}, this.question.charts['nps'][this.accuracy || 'daily']);
    }

    this._updatePayload();
  }
}
