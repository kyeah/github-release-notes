'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _entries = require('babel-runtime/core-js/object/entries');

var _entries2 = _interopRequireDefault(_entries);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _githubApi = require('github-api');

var _githubApi2 = _interopRequireDefault(_githubApi);

var _utils = require('./_utils.js');

var _utils2 = _interopRequireDefault(_utils);

var _template = require('./_template.js');

var _connectivity = require('connectivity');

var _connectivity2 = _interopRequireDefault(_connectivity);

var _templates = require('./templates.json');

var _templates2 = _interopRequireDefault(_templates);

var _objectAssignDeep = require('object-assign-deep');

var _objectAssignDeep2 = _interopRequireDefault(_objectAssignDeep);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaults = {
    tags: [],
    prefix: '',
    template: _templates2.default,
    prerelease: false,
    generate: false,
    quiet: false,
    override: false,
    debug: false,
    ignoreLabels: false,
    ignoreIssuesWith: false,
    ignoreCommitsWith: false,
    groupBy: false,
    milestoneMatch: 'Release {{tag_name}}'
};

var MAX_TAGS_LIMIT = 99;
var TAGS_LIMIT = 30;

/** Class creating release notes and changelog notes */

var Gren = function () {
    function Gren() {
        var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        (0, _classCallCheck3.default)(this, Gren);

        this.options = (0, _objectAssignDeep2.default)({}, defaults, props);
        this.tasks = [];

        var _options = this.options,
            username = _options.username,
            repo = _options.repo,
            token = _options.token,
            apiUrl = _options.apiUrl,
            tags = _options.tags,
            limit = _options.limit,
            ignoreLabels = _options.ignoreLabels,
            ignoreIssuesWith = _options.ignoreIssuesWith,
            ignoreCommitsWith = _options.ignoreCommitsWith,
            ignoreTagsWith = _options.ignoreTagsWith;


        this.options.tags = _utils2.default.convertStringToArray(tags);
        this.options.ignoreLabels = _utils2.default.convertStringToArray(ignoreLabels);
        this.options.ignoreIssuesWith = _utils2.default.convertStringToArray(ignoreIssuesWith);
        this.options.ignoreCommitsWith = _utils2.default.convertStringToArray(ignoreCommitsWith);
        this.options.ignoreTagsWith = _utils2.default.convertStringToArray(ignoreTagsWith);

        if (limit && limit > 0 && limit <= MAX_TAGS_LIMIT) {
            this.options.limit = limit;
        } else if (this.options.tags.indexOf('all') >= 0) {
            this.options.limit = MAX_TAGS_LIMIT;
        } else {
            this.options.limit = TAGS_LIMIT;
        }

        if (!token) {
            throw _chalk2.default.red('You must provide the TOKEN');
        }

        if (this.options.debug) {
            this._outputOptions(this.options);
        }

        var githubApi = new _githubApi2.default({
            token: token
        }, apiUrl);

        this.repo = githubApi.getRepo(username, repo);
        this.issues = githubApi.getIssues(username, repo);
    }

    /**
     * Generate release notes and draft a new release
     *
     * @since  0.10.0
     * @public
     *
     * @return {Promise}
     */


    (0, _createClass3.default)(Gren, [{
        key: 'release',
        value: function () {
            var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                var _this = this;

                var blocks;
                return _regenerator2.default.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _utils2.default.printTask(this.options.quiet, 'Generate release notes');

                                _context.next = 3;
                                return this._hasNetwork();

                            case 3:
                                _context.next = 5;
                                return this._getReleaseBlocks();

                            case 5:
                                blocks = _context.sent;
                                return _context.abrupt('return', blocks.reduce(function (carry, block) {
                                    return carry.then(_this._prepareRelease.bind(_this, block));
                                }, _promise2.default.resolve()));

                            case 7:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function release() {
                return _ref.apply(this, arguments);
            }

            return release;
        }()

        /**
         * Generate changelog file based on the release notes or generate new one
         *
         * @since  0.10.0
         * @public
         *
         * @return {Promise}
         */

    }, {
        key: 'changelog',
        value: function () {
            var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
                var releases;
                return _regenerator2.default.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _utils2.default.printTask(this.options.quiet, 'Generate changelog file');

                                _context2.next = 3;
                                return this._hasNetwork();

                            case 3:
                                this._checkChangelogFile();

                                if (!this.options.generate) {
                                    _context2.next = 10;
                                    break;
                                }

                                _context2.next = 7;
                                return this._getReleaseBlocks();

                            case 7:
                                _context2.t0 = _context2.sent;
                                _context2.next = 13;
                                break;

                            case 10:
                                _context2.next = 12;
                                return this._getListReleases();

                            case 12:
                                _context2.t0 = _context2.sent;

                            case 13:
                                releases = _context2.t0;

                                if (!(releases.length === 0)) {
                                    _context2.next = 16;
                                    break;
                                }

                                throw _chalk2.default.red('There are no releases, use --generate to create release notes, or run the release command.');

                            case 16:
                                return _context2.abrupt('return', this._createChangelog(this._templateReleases(releases)));

                            case 17:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function changelog() {
                return _ref2.apply(this, arguments);
            }

            return changelog;
        }()

        /**
         * Check if the changelog file exists
         *
         * @since 0.8.0
         * @private
         *
         * @return {string}
         */

    }, {
        key: '_checkChangelogFile',
        value: function _checkChangelogFile() {
            var filePath = process.cwd() + '/' + this.options.changelogFilename;

            if (_fs2.default.existsSync(filePath) && !this.options.override) {
                throw _chalk2.default.black(_chalk2.default.bgYellow('Looks like there is already a changelog, to override it use --override'));
            }

            return filePath;
        }

        /**
         * Create the changelog file
         *
         * @since 0.8.0
         * @private
         *
         * @param  {string} body The body of the file
         */

    }, {
        key: '_createChangelog',
        value: function _createChangelog(body) {
            var loaded = _utils2.default.task(this, 'Creating ' + this.options.changelogFilename);
            var filePath = process.cwd() + '/' + this.options.changelogFilename;

            _fs2.default.writeFileSync(filePath, this.options.template.changelogTitle + body);

            loaded(_chalk2.default.green('\nChangelog created in ' + filePath));
        }

        /**
         * Edit a release from a given tag (in the options)
         *
         * @since 0.5.0
         * @private
         *
         * @param  {number} releaseId The id of the release to edit
         * @param  {Object} releaseOptions The options to build the release:
         * @example
         * {
         *   "tag_name": "v1.0.0",
         *   "target_commitish": "master",
         *   "name": "v1.0.0",
         *   "body": "Description of the release",
         *   "draft": false,
         *   "prerelease": false
         * }
         *
         * @return {Promise}
         */

    }, {
        key: '_editRelease',
        value: function () {
            var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(releaseId, releaseOptions) {
                var loaded, _ref4, release;

                return _regenerator2.default.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                loaded = _utils2.default.task(this, 'Updating latest release');
                                _context3.next = 3;
                                return this.repo.updateRelease(releaseId, releaseOptions);

                            case 3:
                                _ref4 = _context3.sent;
                                release = _ref4.data;


                                loaded(_chalk2.default.green(release.name + ' has been successfully updated!') + _chalk2.default.blue('\nSee the results here: ' + release.html_url));

                                return _context3.abrupt('return', release);

                            case 7:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function _editRelease(_x2, _x3) {
                return _ref3.apply(this, arguments);
            }

            return _editRelease;
        }()

        /**
         * Create a release from a given tag (in the options)
         *
         * @since 0.1.0
         * @private
         *
         * @param  {Object} releaseOptions The options to build the release:
         * @example {
         *   "tag_name": "1.0.0",
         *   "target_commitish": "master",
         *   "name": "v1.0.0",
         *   "body": "Description of the release",
         *   "draft": false,
         *   "prerelease": false
         * }
         *
         * @return {Promise}
         */

    }, {
        key: '_createRelease',
        value: function () {
            var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(releaseOptions) {
                var loaded, _ref6, release;

                return _regenerator2.default.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                loaded = _utils2.default.task(this, 'Preparing the release');
                                _context4.next = 3;
                                return this.repo.createRelease(releaseOptions);

                            case 3:
                                _ref6 = _context4.sent;
                                release = _ref6.data;


                                loaded(_chalk2.default.green('\n' + release.name + ' has been successfully created!') + _chalk2.default.blue('\nSee the results here: ' + release.html_url));

                                return _context4.abrupt('return', release);

                            case 7:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function _createRelease(_x4) {
                return _ref5.apply(this, arguments);
            }

            return _createRelease;
        }()

        /**
         * Creates the options to make the release
         *
         * @since 0.2.0
         * @private
         *
         * @param  {Object[]} tags The collection of tags
         *
         * @return {Promise}
         */

    }, {
        key: '_prepareRelease',
        value: function _prepareRelease(block) {
            var releaseOptions = {
                tag_name: block.release,
                name: block.name,
                body: block.body,
                draft: this.options.draft,
                prerelease: this.options.prerelease
            };

            if (block.id) {
                if (!this.options.override) {
                    console.warn(_chalk2.default.black(_chalk2.default.bgYellow('Skipping ' + block.release + ' (use --override to replace it)')));

                    return _promise2.default.resolve();
                }

                return this._editRelease(block.id, releaseOptions);
            }

            return this._createRelease(releaseOptions);
        }

        /**
         * Get the tags information from the given ones, and adds
         * the next one in case only one is given
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Array|string} allTags
         * @param  {Object[]} tags
         *
         * @return {Boolean|Array}
         */

    }, {
        key: '_getSelectedTags',
        value: function _getSelectedTags(allTags) {
            var tags = this.options.tags;


            if (tags.indexOf('all') >= 0) {
                return allTags;
            }

            if (!allTags || !allTags.length || !tags.length) {
                return false;
            }

            var selectedTags = [].concat(tags);

            return allTags.filter(function (_ref7, index) {
                var name = _ref7.name;

                var isSelectedTag = selectedTags.includes(name);

                if (isSelectedTag && selectedTags.length === 1 && allTags[index + 1]) {
                    selectedTags.push(allTags[index + 1].name);
                }
                return isSelectedTag;
            }).slice(0, 2);
        }

        /**
         * Temporary function for this.repo.listReleases to accept options
         *
         * @see  https://github.com/github-tools/github/pull/485
         * @param  {Object} options
         *
         * @return {Promise}
         */

    }, {
        key: '_listTags',
        value: function _listTags(options) {
            return this.repo._request('GET', '/repos/' + this.repo.__fullname + '/tags', options);
        }

        /**
         * Get all the tags of the repo
         *
         * @since 0.1.0
         * @private
         *
         * @param {Array} releases
         * @param {number} page
         *
         * @return {Promise}
         */

    }, {
        key: '_getLastTags',
        value: function () {
            var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(releases) {
                var _this2 = this;

                var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
                var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.options.limit;

                var _ref9, link, tags, filteredTags, totalPages;

                return _regenerator2.default.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._listTags({
                                    per_page: limit,
                                    page: page
                                });

                            case 2:
                                _ref9 = _context5.sent;
                                link = _ref9.headers.link;
                                tags = _ref9.data;

                                if (tags.length) {
                                    _context5.next = 7;
                                    break;
                                }

                                throw _chalk2.default.red('\nLooks like you have no tags! Tag a commit first and then run gren again');

                            case 7:
                                filteredTags = (this._getSelectedTags(tags) || [tags[0], tags[1]]).filter(Boolean).filter(function (_ref10) {
                                    var name = _ref10.name;
                                    return _this2.options.ignoreTagsWith.every(function (ignoreTag) {
                                        return !name.match(ignoreTag);
                                    });
                                }).map(function (tag) {
                                    var tagRelease = releases ? releases.filter(function (release) {
                                        return release.tag_name === tag.name;
                                    })[0] : false;
                                    var releaseId = tagRelease ? tagRelease.id : null;

                                    return {
                                        tag: tag,
                                        releaseId: releaseId
                                    };
                                });
                                totalPages = this._getLastPage(link);

                                if (!((this.options.tags.indexOf('all') >= 0 || filteredTags.length < 2) && totalPages && +page < totalPages)) {
                                    _context5.next = 11;
                                    break;
                                }

                                return _context5.abrupt('return', this._getLastTags(releases, page + 1).then(function (moreTags) {
                                    return moreTags.concat(filteredTags);
                                }));

                            case 11:
                                return _context5.abrupt('return', filteredTags);

                            case 12:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function _getLastTags(_x7) {
                return _ref8.apply(this, arguments);
            }

            return _getLastTags;
        }()

        /**
         * Get the dates of the last two tags
         *
         * @since 0.1.0
         * @private
         *
         * @param  {Object[]} tags List of all the tags in the repo
         *
         * @return {Promise[]}     The promises which returns the dates
         */

    }, {
        key: '_getTagDates',
        value: function _getTagDates(tags) {
            var _this3 = this;

            return tags.map(function () {
                var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(tag) {
                    var _ref12, committer;

                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                        while (1) {
                            switch (_context6.prev = _context6.next) {
                                case 0:
                                    _context6.next = 2;
                                    return _this3.repo.getCommit(tag.tag.commit.sha);

                                case 2:
                                    _ref12 = _context6.sent;
                                    committer = _ref12.data.committer;
                                    return _context6.abrupt('return', {
                                        id: tag.releaseId,
                                        name: tag.tag.name,
                                        date: committer.date
                                    });

                                case 5:
                                case 'end':
                                    return _context6.stop();
                            }
                        }
                    }, _callee6, _this3);
                }));

                return function (_x8) {
                    return _ref11.apply(this, arguments);
                };
            }());
        }

        /**
         * Temporary function for this.repo.listReleases to accept options
         *
         * @see  https://github.com/github-tools/github/pull/485
         * @param  {Object} options
         *
         * @return {Promise}
         */

    }, {
        key: '_listReleases',
        value: function _listReleases(options) {
            return this.repo._request('GET', '/repos/' + this.repo.__fullname + '/releases', options);
        }

        /**
         * Get the merged pull requests from the repo
         *
         * @private
         *
         * @param {number} page
         * @param {number} limit
         *
         * @return {Promise[]}     The promises which returns pull requests
         */

    }, {
        key: '_getMergedPullRequests',
        value: function () {
            var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(since) {
                var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
                var limit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 100;
                var results, link, prs, totalPages, filterPrs;
                return _regenerator2.default.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                _context7.next = 2;
                                return this.repo.listPullRequests({
                                    state: 'closed',
                                    sort: 'updated',
                                    direction: 'desc',
                                    per_page: limit,
                                    page: page
                                });

                            case 2:
                                results = _context7.sent;
                                link = results.headers.link, prs = results.data;
                                totalPages = this._getLastPage(link);
                                filterPrs = prs.filter(function (pr) {
                                    return pr.merged_at;
                                });

                                if (!(prs.length > 0 && since < prs[prs.length - 1].updated_at && totalPages && +page < totalPages)) {
                                    _context7.next = 8;
                                    break;
                                }

                                return _context7.abrupt('return', this._getMergedPullRequests(since, page + 1).then(function (prsResults) {
                                    return prsResults.concat(filterPrs);
                                }));

                            case 8:
                                return _context7.abrupt('return', filterPrs);

                            case 9:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function _getMergedPullRequests(_x11) {
                return _ref13.apply(this, arguments);
            }

            return _getMergedPullRequests;
        }()

        /**
         * Get the last page from a Hypermedia link
         *
         * @since  0.11.1
         * @private
         *
         * @param  {string} link
         *
         * @return {boolean|number}
         */

    }, {
        key: '_getLastPage',
        value: function _getLastPage(link) {
            var linkMatch = Boolean(link) && link.match(/page=(\d+)>; rel="last"/);

            return linkMatch && +linkMatch[1];
        }

        /**
         * Get all releases
         *
         * @since 0.5.0
         * @private
         *
         * @return {Promise} The promise which resolves an array of releases
         */

    }, {
        key: '_getListReleases',
        value: function () {
            var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8() {
                var page = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
                var limit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.options.limit;

                var loaded, _ref15, link, releases, totalPages;

                return _regenerator2.default.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                loaded = _utils2.default.task(this, 'Getting the list of releases');
                                _context8.next = 3;
                                return this._listReleases({
                                    per_page: limit,
                                    page: page
                                });

                            case 3:
                                _ref15 = _context8.sent;
                                link = _ref15.headers.link;
                                releases = _ref15.data;
                                totalPages = this._getLastPage(link);

                                if (!(this.options.tags.indexOf('all') >= 0 && totalPages && +page < totalPages)) {
                                    _context8.next = 9;
                                    break;
                                }

                                return _context8.abrupt('return', this._getListReleases(page + 1).then(function (moreReleases) {
                                    return moreReleases.concat(releases);
                                }));

                            case 9:

                                loaded('Releases found: ' + releases.length);

                                return _context8.abrupt('return', releases);

                            case 11:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function _getListReleases() {
                return _ref14.apply(this, arguments);
            }

            return _getListReleases;
        }()

        /**
         * Generate the releases bodies from a release Objects Array
         *
         * @since 0.8.0
         * @private
         * @ignore
         *
         * @param  {Array} releases The release Objects Array coming from GitHub
         *
         * @return {string}
         */

    }, {
        key: '_templateReleases',
        value: function _templateReleases(releases) {
            var template = this.options.template;


            return releases.map(function (release) {
                return (0, _template.generate)({
                    release: release.name,
                    date: _utils2.default.formatDate(new Date(release.published_at)),
                    body: release.body
                }, template.release);
            }).join(template.releaseSeparator);
        }

        /**
         * Return the templated commit message
         *
         * @since 0.1.0
         * @private
         *
         * @param  {Object} commit
         *
         * @return {string}
         */
        // eslint-disable-next-line camelcase

    }, {
        key: '_templateCommits',
        value: function _templateCommits(_ref16) {
            var sha = _ref16.sha,
                html_url = _ref16.html_url,
                _ref16$commit = _ref16.commit,
                name = _ref16$commit.author.name,
                message = _ref16$commit.message;

            return (0, _template.generate)({
                sha: sha,
                message: message.split('\n')[0],
                url: html_url,
                author: name
            }, this.options.template.commit);
        }

        /**
         * Generate the MD template from all the labels of a specific issue
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Object} issue
         *
         * @return {string}
         */

    }, {
        key: '_templateLabels',
        value: function _templateLabels(issue) {
            var _this4 = this;

            var labels = (0, _from2.default)(issue.labels);

            if (!labels.length && this.options.template.noLabel) {
                labels.push({ name: this.options.template.noLabel });
            }

            return labels.filter(function (label) {
                return _this4.options.ignoreLabels.indexOf(label.name) === -1;
            }).map(function (label) {
                return (0, _template.generate)({
                    label: label.name
                }, _this4.options.template.label);
            }).join('');
        }

        /**
         * Generate the MD template for each issue
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Object} issue
         *
         * @return {string}
         */

    }, {
        key: '_templateIssue',
        value: function _templateIssue(issue) {
            return (0, _template.generate)({
                labels: this._templateLabels(issue),
                name: issue.title,
                text: '#' + issue.number,
                url: issue.html_url,
                body: issue.body,
                pr_base: issue.base && issue.base.ref,
                pr_head: issue.head && issue.head.ref
            }, this.options.template.issue);
        }

        /**
         * Generate the Changelog issues body template
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Object[]} blocks
         *
         * @return {string}
         */

    }, {
        key: '_templateBody',
        value: function _templateBody(body, rangeBody) {
            if (Array.isArray(body) && body.length) {
                return body.join('\n') + '\n';
            }

            if (rangeBody) {
                return rangeBody + '\n';
            }

            return '*No changelog for this release.*\n';
        }

        /**
         * Generates the template for the groups
         *
         * @since  0.8.0
         * @private
         *
         * @param  {Object} groups The groups to template e.g.
         * {
         *     'bugs': [{...}, {...}, {...}]
         * }
         *
         * @return {string}
         */

    }, {
        key: '_templateGroups',
        value: function _templateGroups(groups) {
            var _this5 = this;

            return (0, _entries2.default)(groups).map(function (_ref17) {
                var _ref18 = (0, _slicedToArray3.default)(_ref17, 2),
                    key = _ref18[0],
                    value = _ref18[1];

                var heading = (0, _template.generate)({
                    heading: key
                }, _this5.options.template.group);
                var body = value.join('\n');

                return heading + '\n' + body;
            });
        }

        /**
         * Filter a commit based on the includeMessages option and commit message
         *
         * @since  0.10.0
         * @private
         *
         * @param  {Object} commit
         *
         * @return {Boolean}
         */

    }, {
        key: '_filterCommit',
        value: function _filterCommit(_ref19) {
            var message = _ref19.commit.message;

            var messageType = this.options.includeMessages;
            var filterMap = {
                merges: function merges(message) {
                    return message.match(/^merge/i);
                },
                commits: function commits(message) {
                    return !message.match(/^merge/i);
                },
                all: function all() {
                    return true;
                }
            };
            var shouldIgnoreMessage = this.options.ignoreCommitsWith.every(function (commitMessage) {
                var regex = new RegExp(commitMessage, 'i');
                return !message.split('\n')[0].match(regex);
            });

            if (filterMap[messageType]) {
                return filterMap[messageType](message) && shouldIgnoreMessage;
            }

            return filterMap.commits(message) && shouldIgnoreMessage;
        }

        /**
         * Return a commit messages generated body
         *
         * @since 0.1.0
         * @private
         *
         * @param  {Array} commits
         *
         * @return {string}
         */

    }, {
        key: '_generateCommitsBody',
        value: function _generateCommitsBody() {
            var commits = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

            var bodyMessages = (0, _from2.default)(commits);

            if (bodyMessages.length === 1) {
                bodyMessages.push(null);
            }

            return bodyMessages.slice(0, -1).filter(this._filterCommit.bind(this)).map(this._templateCommits.bind(this)).join('\n');
        }

        /**
         * Gets all the commits between two dates
         *
         * @since 0.1.0
         * @private
         *
         * @param  {string} since The since date in ISO
         * @param  {string} until The until date in ISO
         *
         * @return {Promise}      The promise which resolves the [Array] commit messages
         */

    }, {
        key: '_getCommitsBetweenTwo',
        value: function () {
            var _ref20 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(since, until) {
                var options, _ref21, data;

                return _regenerator2.default.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                options = {
                                    since: since,
                                    until: until,
                                    per_page: 100
                                };
                                _context9.next = 3;
                                return this.repo.listCommits(options);

                            case 3:
                                _ref21 = _context9.sent;
                                data = _ref21.data;
                                return _context9.abrupt('return', data);

                            case 6:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function _getCommitsBetweenTwo(_x15, _x16) {
                return _ref20.apply(this, arguments);
            }

            return _getCommitsBetweenTwo;
        }()

        /**
         * Get the blocks of commits based on release dates
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Array} releaseRanges The array of date ranges
         *
         * @return {Promise[]}
         */

    }, {
        key: '_getCommitBlocks',
        value: function () {
            var _ref22 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(releaseRanges) {
                var _this6 = this;

                var taskName, loaded, ranges;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                taskName = 'Creating the body blocks from commits';
                                loaded = _utils2.default.task(this, taskName);
                                _context11.next = 4;
                                return _promise2.default.all(releaseRanges.map(function () {
                                    var _ref23 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(range) {
                                        var _range, since, until, commits;

                                        return _regenerator2.default.wrap(function _callee10$(_context10) {
                                            while (1) {
                                                switch (_context10.prev = _context10.next) {
                                                    case 0:
                                                        _range = (0, _slicedToArray3.default)(range, 2), since = _range[0].date, until = _range[1].date;


                                                        _this6.tasks[taskName].text = 'Get commits between ' + _utils2.default.formatDate(new Date(since)) + ' and ' + _utils2.default.formatDate(new Date(until));
                                                        _context10.next = 4;
                                                        return _this6._getCommitsBetweenTwo(range[1].date, range[0].date);

                                                    case 4:
                                                        commits = _context10.sent;
                                                        return _context10.abrupt('return', {
                                                            id: range[0].id,
                                                            name: _this6.options.prefix + range[0].name,
                                                            release: range[0].name,
                                                            published_at: range[0].date,
                                                            body: _this6._generateCommitsBody(commits) + '\n'
                                                        });

                                                    case 6:
                                                    case 'end':
                                                        return _context10.stop();
                                                }
                                            }
                                        }, _callee10, _this6);
                                    }));

                                    return function (_x18) {
                                        return _ref23.apply(this, arguments);
                                    };
                                }()));

                            case 4:
                                ranges = _context11.sent;


                                loaded('Commit ranges loaded: ' + ranges.length);

                                return _context11.abrupt('return', ranges);

                            case 7:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function _getCommitBlocks(_x17) {
                return _ref22.apply(this, arguments);
            }

            return _getCommitBlocks;
        }()

        /**
         * Compare the ignored labels with the passed ones
         *
         * @since 0.10.0
         * @private
         *
         * @param  {Array} labels   The labels to check
         * @example [{
         *     name: 'bug'
         * }]
         *
         * @return {boolean}    If the labels array contains any of the ignore ones
         */

    }, {
        key: '_lablesAreIgnored',
        value: function _lablesAreIgnored(labels) {
            if (!labels || !Array.isArray(labels)) {
                return false;
            }

            var ignoreIssuesWith = this.options.ignoreIssuesWith;


            return ignoreIssuesWith.some(function (label) {
                return labels.map(function (_ref24) {
                    var name = _ref24.name;
                    return name;
                }).includes(label);
            });
        }

        /**
         * Get all the closed issues from the current repo
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Array} releaseRanges The array of date ranges
         *
         * @return {Promise} The promise which resolves the list of the issues
         */

    }, {
        key: '_getClosedIssues',
        value: function () {
            var _ref25 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(releaseRanges) {
                var type, loaded, _ref26, issues;

                return _regenerator2.default.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                type = {
                                    issues: 'Issues',
                                    milestones: 'Issues'
                                }[this.options.dataSource];
                                loaded = _utils2.default.task(this, 'Getting all closed ' + type);
                                _context12.next = 4;
                                return this.issues.listIssues({
                                    state: 'closed',
                                    since: releaseRanges[releaseRanges.length - 1][1].date
                                });

                            case 4:
                                _ref26 = _context12.sent;
                                issues = _ref26.data;


                                loaded(type + ' found: ' + issues.length);

                                return _context12.abrupt('return', issues);

                            case 8:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function _getClosedIssues(_x19) {
                return _ref25.apply(this, arguments);
            }

            return _getClosedIssues;
        }()

        /**
         * Group the issues based on their first label
         *
         * @since 0.8.0
         * @private
         *
         * @param  {Array} issues
         *
         * @return {string}
         */

    }, {
        key: '_groupByLabel',
        value: function _groupByLabel(issues) {
            var _this7 = this;

            var groups = [];

            (0, _values2.default)((0, _objectAssignDeep2.default)({}, issues)).forEach(function (issue) {
                if (!issue.labels.length) {
                    if (!_this7.options.template.noLabel) {
                        return;
                    }

                    issue.labels.push({ name: _this7.options.template.noLabel });
                }

                var labelName = issue.labels[0].name;

                if (!groups[labelName]) {
                    groups[labelName] = [];
                }

                groups[labelName].push(_this7._templateIssue(issue));
            });

            return this._templateGroups(_utils2.default.sortObject(groups));
        }

        /**
         * Create groups of issues based on labels
         *
         * @since  0.8.0
         * @private
         *
         * @param  {Array} issues The array of all the issues.
         *
         * @return {Array}
         */

    }, {
        key: '_groupBy',
        value: function _groupBy(passedIssues) {
            var _this8 = this;

            var groupBy = this.options.groupBy;

            var issues = (0, _values2.default)((0, _objectAssignDeep2.default)({}, passedIssues));

            if (!groupBy || groupBy === 'false') {
                return issues.map(this._templateIssue.bind(this));
            }

            if (groupBy === 'label') {
                return this._groupByLabel(issues);
            }

            if ((typeof groupBy === 'undefined' ? 'undefined' : (0, _typeof3.default)(groupBy)) !== 'object' || Array.isArray(groupBy)) {
                throw _chalk2.default.red('The option for groupBy is invalid, please check the documentation');
            }

            var allLabels = (0, _values2.default)(groupBy).reduce(function (carry, group) {
                return carry.concat(group);
            }, []);
            var groups = (0, _keys2.default)(groupBy).reduce(function (carry, group, i, arr) {
                var groupIssues = issues.filter(function (issue) {
                    if (!issue.labels.length && _this8.options.template.noLabel) {
                        issue.labels.push({ name: _this8.options.template.noLabel });
                    }

                    return issue.labels.some(function (label) {
                        var isOtherLabel = groupBy[group].indexOf('...') !== -1 && allLabels.indexOf(label.name) === -1;

                        return groupBy[group].indexOf(label.name) !== -1 || isOtherLabel;
                    }) && !arr.filter(function (title) {
                        return carry[title];
                    }).some(function (title) {
                        return carry[title].indexOf(_this8._templateIssue(issue)) !== -1;
                    });
                }).map(_this8._templateIssue.bind(_this8));

                if (groupIssues.length) {
                    carry[group] = groupIssues;
                }

                return carry;
            }, {});

            return this._templateGroups(groups);
        }

        /**
         * Filter the issue based on gren options and labels
         *
         * @since 0.9.0
         * @private
         *
         * @param  {Object} issue
         *
         * @return {Boolean}
         */

    }, {
        key: '_filterIssue',
        value: function _filterIssue(issue) {
            var dataSource = this.options.dataSource;


            return (issue.pull_request ? dataSource === 'prs' : dataSource === 'issues' | dataSource === 'milestones') && !this._lablesAreIgnored(issue.labels) && !((this.options.onlyMilestones || dataSource === 'milestones') && !issue.milestone);
        }

        /**
         * Filter the pull request based on gren options and labels
         * @private
         *
         * @param  {Object} pullRequest
         *
         * @return {Boolean}
         */

    }, {
        key: '_filterPullRequest',
        value: function _filterPullRequest(pullRequest) {
            return !this._lablesAreIgnored(pullRequest.labels) && !(this.options.onlyMilestones && !pullRequest.milestone);
        }

        /**
         * Filter the issue based on the date range, or if is in the release
         * milestone.
         *
         * @since 0.9.0
         * @private
         *
         * @param  {Array} range The release ranges
         * @param  {Object} issue GitHub issue
         *
         * @return {Boolean}
         */

    }, {
        key: '_filterBlockIssue',
        value: function _filterBlockIssue(range, issue) {
            if (this.options.dataSource === 'milestones') {
                return this.options.milestoneMatch.replace('{{tag_name}}', range[0].name) === issue.milestone.title;
            }

            return _utils2.default.isInRange(Date.parse(issue.closed_at), Date.parse(range[1].date), Date.parse(range[0].date));
        }

        /**
         * Filter the pull requests in case the release is milestone,
         * or otherwise by dates range.
         *
         * @private
         *
         * @param  {Array} range The release ranges
         * @param  {Object} pullRequest GitHub pull request
         *
         * @return {Boolean}
         */

    }, {
        key: '_filterBlockPullRequest',
        value: function _filterBlockPullRequest(range, pullRequest) {
            if (this.options.dataSource === 'milestones') {
                return this.options.milestoneMatch.replace('{{tag_name}}', range[0].name) === pullRequest.milestone.title;
            }

            return _utils2.default.isInRange(Date.parse(pullRequest.merged_at), Date.parse(range[1].date), Date.parse(range[0].date));
        }

        /**
         * Get the blocks of issues based on release dates
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Array} releaseRanges The array of date ranges
         *
         * @return {Promise[]}
         */

    }, {
        key: '_getIssueBlocks',
        value: function () {
            var _ref27 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(releaseRanges) {
                var _this9 = this;

                var issues, release;
                return _regenerator2.default.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                _context13.next = 2;
                                return this._getClosedIssues(releaseRanges);

                            case 2:
                                issues = _context13.sent;
                                release = releaseRanges.map(function (range) {
                                    var filteredIssues = (0, _from2.default)(issues).filter(_this9._filterIssue.bind(_this9)).filter(_this9._filterBlockIssue.bind(_this9, range));
                                    var body = (!range[0].body || _this9.options.override) && _this9._groupBy(filteredIssues);
                                    return {
                                        id: range[0].id,
                                        release: range[0].name,
                                        name: _this9.options.prefix + range[0].name,
                                        published_at: range[0].date,
                                        body: _this9._templateBody(body, range[0].body)
                                    };
                                });
                                return _context13.abrupt('return', release);

                            case 5:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function _getIssueBlocks(_x20) {
                return _ref27.apply(this, arguments);
            }

            return _getIssueBlocks;
        }()
        /**
         * Get the blocks of pull requests based on the release dates
         *
         * @private
         *
         * @param  {Array} releaseRanges The array of date ranges
         *
         * @return {Promise[]}
         */

    }, {
        key: '_getPullRequestsBlocks',
        value: function () {
            var _ref28 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14(releaseRanges) {
                var _this10 = this;

                var loaded, since, prs, totalPrs, release;
                return _regenerator2.default.wrap(function _callee14$(_context14) {
                    while (1) {
                        switch (_context14.prev = _context14.next) {
                            case 0:
                                loaded = _utils2.default.task(this, 'Getting all merged pull requests');
                                since = releaseRanges[releaseRanges.length - 1][1].date;
                                _context14.next = 4;
                                return this._getMergedPullRequests(since);

                            case 4:
                                prs = _context14.sent;
                                totalPrs = 0;
                                release = releaseRanges.map(function (range) {
                                    var filteredPullRequests = (0, _from2.default)(prs).filter(_this10._filterPullRequest.bind(_this10)).filter(_this10._filterBlockPullRequest.bind(_this10, range));
                                    totalPrs += filteredPullRequests.length;
                                    var body = (!range[0].body || _this10.options.override) && _this10._groupBy(filteredPullRequests);
                                    return {
                                        id: range[0].id,
                                        release: range[0].name,
                                        name: _this10.options.prefix + range[0].name,
                                        published_at: range[0].date,
                                        body: _this10._templateBody(body, range[0].body)
                                    };
                                });

                                loaded('Pull Requests found: ' + totalPrs);
                                return _context14.abrupt('return', release);

                            case 9:
                            case 'end':
                                return _context14.stop();
                        }
                    }
                }, _callee14, this);
            }));

            function _getPullRequestsBlocks(_x21) {
                return _ref28.apply(this, arguments);
            }

            return _getPullRequestsBlocks;
        }()

        /**
         * Sort releases by dates
         *
         * @since 0.5.0
         * @private
         *
         * @param {Array} releaseDates
         *
         * @return {Array}
         */

    }, {
        key: '_sortReleasesByDate',
        value: function _sortReleasesByDate(releaseDates) {
            return (0, _from2.default)(releaseDates).sort(function (release1, release2) {
                return new Date(release2.date) - new Date(release1.date);
            });
        }

        /**
         * Create the ranges of release dates
         *
         * @since 0.5.0
         * @private
         *
         * @param  {Array} releaseDates The release dates
         *
         * @return {Array}
         */

    }, {
        key: '_createReleaseRanges',
        value: function _createReleaseRanges(releaseDates) {
            var ranges = [];
            var range = 2;
            var sortedReleaseDates = this._sortReleasesByDate(releaseDates);

            if (sortedReleaseDates.length === 1 || this.options.tags.indexOf('all') >= 0) {
                sortedReleaseDates.push({
                    id: 0,
                    date: new Date(0)
                });
            }

            for (var i = 0; i < sortedReleaseDates.length - 1; i++) {
                ranges.push(sortedReleaseDates.slice(i, i + range));
            }

            return ranges;
        }

        /**
         * Generate release blocks based on issues or commit messages
         * depending on the option.
         *
         * @return {Promise} Resolving the release blocks
         */

    }, {
        key: '_getReleaseBlocks',
        value: function () {
            var _ref29 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15() {
                var loaded, dataSource, releases, tags, releaseDates;
                return _regenerator2.default.wrap(function _callee15$(_context15) {
                    while (1) {
                        switch (_context15.prev = _context15.next) {
                            case 0:
                                loaded = _utils2.default.task(this, 'Getting releases');
                                dataSource = {
                                    issues: this._getIssueBlocks.bind(this),
                                    commits: this._getCommitBlocks.bind(this),
                                    milestones: this._getIssueBlocks.bind(this),
                                    prs: this._getPullRequestsBlocks.bind(this)
                                };
                                _context15.next = 4;
                                return this._getListReleases();

                            case 4:
                                releases = _context15.sent;

                                this.tasks['Getting releases'].text = 'Getting tags';

                                _context15.next = 8;
                                return this._getLastTags(releases.length ? releases : false);

                            case 8:
                                tags = _context15.sent;

                                this._validateRequiredTagsExists(tags, this.options.tags);
                                _context15.next = 12;
                                return _promise2.default.all(this._getTagDates(tags));

                            case 12:
                                releaseDates = _context15.sent;


                                loaded('Tags found: ' + tags.map(function (_ref30) {
                                    var name = _ref30.tag.name;
                                    return name;
                                }).join(', '));

                                return _context15.abrupt('return', dataSource[this.options.dataSource](this._createReleaseRanges(releaseDates)));

                            case 15:
                            case 'end':
                                return _context15.stop();
                        }
                    }
                }, _callee15, this);
            }));

            function _getReleaseBlocks() {
                return _ref29.apply(this, arguments);
            }

            return _getReleaseBlocks;
        }()

        /**
         * Check that the require tags are exists in tags
         *
         * @param {Array} tags
         * @param {Array} requireTags
         *
         * @throws{Exception} Will throw exception in case that
         * @requireTags were set to 2 specific tags and these tags aren't exists in @tags
         */

    }, {
        key: '_validateRequiredTagsExists',
        value: function _validateRequiredTagsExists(tags, requireTags) {
            if (requireTags.indexOf('all') >= 0 || !(requireTags instanceof Array)) return;

            var tagsNames = tags.map(function (tagData) {
                return tagData.tag.name;
            });

            var missingTags = requireTags.filter(function (requireTag) {
                return tagsNames.indexOf(requireTag) < 0;
            });
            if (missingTags.length > 0) {
                var inflection = missingTags.length === 1 ? 'tag is' : 'tags are';
                throw _chalk2.default.red('\nThe following ' + inflection + ' not found in the repository: ' + missingTags + '. ' + 'please provide existing tags.');
            }
        }

        /**
         * Check if there is connectivity
         *
         * @since 0.5.0
         * @private
         *
         * @return {Promise}
         */

    }, {
        key: '_hasNetwork',
        value: function _hasNetwork() {
            return new _promise2.default(function (resolve) {
                (0, _connectivity2.default)(function (isOnline) {
                    if (!isOnline) {
                        console.warn(_chalk2.default.yellow('WARNING: Looks like you don\'t have network connectivity!'));
                    }

                    resolve(isOnline);
                });
            });
        }

        /**
         * Output the options in the terminal in a formatted way
         *
         * @param  {Object} options
         */

    }, {
        key: '_outputOptions',
        value: function _outputOptions(options) {
            var camelcaseToSpaces = function camelcaseToSpaces(value) {
                return value.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/\w/, function (a) {
                    return a.toUpperCase();
                });
            };
            var outputs = (0, _entries2.default)(options).filter(function (option) {
                return option !== 'debug';
            }).map(function (_ref31) {
                var _ref32 = (0, _slicedToArray3.default)(_ref31, 2),
                    key = _ref32[0],
                    value = _ref32[1];

                return _chalk2.default.yellow(camelcaseToSpaces(key)) + ': ' + (value.toString() || 'empty');
            });

            process.stdout.write('\n' + _chalk2.default.blue('Options: \n') + outputs.join('\n') + '\n');
        }
    }]);
    return Gren;
}();

exports.default = Gren;