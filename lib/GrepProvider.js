'use babel';

/*global atom*/

/*
 * Copyright (c) 2015-present, Valerii Iatsko
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const _ = require(atom.packages.resourcePath + '/node_modules/underscore-plus');

import { FileResult, Provider, ProviderType } from 'nuclide-quick-open-interfaces';
import {regexp} from 'nuclide-commons';
const {safeRegExpFromString} = regexp;
import { exec } from 'child_process';
import path from 'path';
import flatten from 'lodash.flatten';
import GrepResultComponent from './GrepResultComponent';

let processes = [];

const GrepProvider: Provider = {

  getName(): string {
    return 'GrepProvider';
  },

  getComponentForItem(item, serviceName, dirName) {
    return GrepResultComponent.getComponentForItem(item, serviceName, dirName);
  },

  getProviderType(): ProviderType {
    return 'GLOBAL';
  },

  getDebounceDelay(): number {
    return 0;
  },

  isRenderable(): boolean {
    return true;
  },

  getAction(): string {
    return 'git-grep-provider:toggle-provider';
  },

  getPromptText(): string {
    return 'Search content of files';
  },

  getTabTitle(): string {
    return 'Grep';
  },

  safe_tags_regex(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },

  parseGitGrep(stdout, query) {
    var at, res, content, filePath, i, len, line, ref, ref1, results;

    ref = stdout.split('\n');

    results = [];

    for (i = 0, len = ref.length; i < len; i++) {
      line = ref[i];

      if (!(line.length > 5)) {
        continue;
      }

      ref1 = line.split(/\:\d+\:/), filePath = ref1[0], content = ref1[1];

      res = line.match(/\:\d+\:/);

      if (res) {
        at = parseInt(res[0].slice(1, +(line.length - 2) + 1 || 9e9), 10);
        // console.log({
        //   filePath: filePath,
        //   rootPath: null,
        //   line: at,
        //   content: content,
        //   raw: line
        // })

        const column = content.split(query)[0].length;

        const splittedLine = this.safe_tags_regex(content).split(query);
        const hlLine = splittedLine.join('<strong>' + query + '</strong>');

        //console.log(at, splittedLine[0].length);
        results.push({
          path: filePath ? filePath : '',
          matchIndexes: [],
          line: at - 1,
          column: splittedLine[0].length,
          hlLine: hlLine,
          query: query,
          content: content
        });
      }
    }
    return results;
  },

  _grep(rootPath, query) {
    return new Promise((done, reject) => {
      if (query === '') {
        return done([]);
      }

      const command = "git grep --cached -n --no-color '" + query + "'";

      processes.push(exec(command, {
        cwd: rootPath,
        maxBuffer: 1024 * 500 * 500
      }, (err, stdout, stderr) => {
        if (err) {
          return done([]);
        }

        if (stderr) {
          return reject(stderr);
        }

        let lines = this.parseGitGrep(stdout, query).map(function(line) {
          line.rootPath = rootPath;
          line.path = path.join(rootPath, line.path);
          return line;
        });

        return done(lines);
      }));
    });
  },

  executeQuery(query: string): Promise<Array<FileResult>> {
    const rootPaths = atom.project.rootDirectories.map((root) => {
      return root.path;
    });

    _.each(processes, (proc) => {
      try {
        proc.kill();
      } catch(e) {

      }
    });

    processes = [];

    return Promise.all(
      rootPaths.map((rootPath) => {
        return this._grep(rootPath, query);
      })
    ).then((arrays) => {
      return _.first([].concat.apply([], arrays), 50);
    });
  },

};

module.exports = GrepProvider;
