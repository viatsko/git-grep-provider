'use babel';

/*global atom*/

/*
 * Copyright (c) 2015-present, Valerii Iatsko
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  FileResult,
} from 'nuclide-quick-open-interfaces';

const React = require('react-for-atom');
const {fileTypeClass} = require('nuclide-atom-helpers');
const path = require('path');

class GrepResultComponent {

  static getComponentForItem(
    item: FileResult,
    serviceName: string,
    dirName: string
  ): ReactElement {
    // Trim the `dirName` off the `filePath` since that's shown by the group
    const filePath = item.path.startsWith(dirName)
      ? '.' + item.path.slice(dirName.length)
      : item.path;
    const matchIndexes = item.matchIndexes && item.path.startsWith(dirName)
      ? item.matchIndexes.map(i => i - (dirName.length - 1))
      : [];

    const filenameStart = filePath.lastIndexOf(path.sep);
    const importantIndexes = [filenameStart, filePath.length]
      .concat(matchIndexes)
      .sort((index1, index2) => index1 - index2);

    const folderComponents = [];
    const filenameComponents = [];

    let last = -1;
    // Split the path into it's path and directory, with matching characters pulled out and
    //  highlighted.
    // When there's no matches, the ouptut is equivalent to just calling path.dirname/basename.
    importantIndexes.forEach((index) => {
      // If the index is after the filename start, push the new text elements
      // into `filenameComponents`, otherwise push them into `folderComponents`.
      const target = index <= filenameStart ? folderComponents : filenameComponents;

      // If there was text before the `index`, push it onto `target` unstyled.
      const previousString = filePath.slice(last + 1, index);
      if (previousString.length !== 0) {
        target.push(<span key={index + 'prev'}>{previousString}</span>);
      }

      // Don't put the '/' between the folder path and the filename on either line.
      if (index !== filenameStart && index < filePath.length) {
        const character = filePath.charAt(index);
        target.push(<span key={index} className="quick-open-file-search-match">{character}</span>);
      }

      last = index;
    });

    const filenameClasses = ['file', 'icon', fileTypeClass(filePath)].join(' ');
    const folderClasses = ['path', 'no-icon'].join(' ');

    // `data-name` is support for the "file-icons" package.
    // See: https://atom.io/packages/file-icons
    return (
      <div>
        <span className={filenameClasses} data-name={path.basename(filePath)}>
          {filenameComponents}
        </span>
        <span className={folderClasses}>{folderComponents}</span>
        <div dangerouslySetInnerHTML={{__html: item.hlLine}}></div>
      </div>
    );
  }
}

module.exports = GrepResultComponent;
