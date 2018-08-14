const path = require('path');
const fs = require('fs');

const { fileExists,
        runBin,
        readFile,
        jsonSafeParse,
        readDir,
        isInChangeWindow,
        tfjsonBin,
        getTfJsonUrl,
        getTfJson
      } = require('../../lib/generic.js');

describe('tfjsonBin', () => {
  it('tfjson not found', () => {
    const modules = path.join(__dirname, '..','..', 'node_modules', '.bin');
    spyOn(fs,'readdirSync').and.returnValue(['file-does-not-exist-1','file-does-not-exist-2']);
    try{
      tfjsonBin()
      expect('This should not pass').toEqual(true);
    }catch(e){
      expect(e).toEqual(new Error(`Failed to find tfjson in ${modules}`));
    }
  });

  it('Expect to find tfjson', () => {
    expect(tfjsonBin()).not.toBeFalsy(fileExists(tfjsonBin()));
    expect(tfjsonBin()).toMatch(/tfjson/);
  });
});

describe('runBin', () => {
  it('run valid bin and was output', () => {
    expect(runBin('/bin/ls',[__dirname]).stdout.toString()).toEqual(readDir(__dirname).join('\n') + '\n');
  });

  it('tries to run invalid bin, return null', () => {
    expect(runBin('/bin/invalid-bin',[__dirname])).toEqual(null);
  });
});

describe('readDir', () => {
  it('returns files that exist on dir', () => {
    expect((readDir(__dirname)).length).not.toBeLessThan(0);
    expect(readDir(__dirname)).toContain(path.basename(__filename));
  });
  it('return null because of invalid dir', () => {
    expect(readDir('/invalid/dir')).toEqual(null);
  });
});

describe('readFile', () => {
  it('read valid file', () => {
    expect(JSON.parse(readFile('package.json'))).toEqual(require('../../package.json'));
  });

  it('read invalid file', () => {
    expect(readFile('invalid-file')).toEqual(null);
  });
});

describe('fileExists', () => {
  it('returns true when a file does exist', () => {
    expect(fileExists(__filename)).toEqual(true);
  });
  it("returns false when a file doesn't exist", () => {
    expect(fileExists('file_that_doesnt_exist.txt')).toEqual(false);
  });
});

describe('jsonSafeParse', () => {
  it('should parse and return an object - successfully', () => {
    let output = jsonSafeParse('[]');
    expect(output).toEqual([]);
  });
  it('should parse and return an object - unsuccessfully', () => {
    let output = jsonSafeParse('[');
    expect(output).toEqual(null);
  });
});

describe('isInChangeWindow', () => {
  it('Object does not have property changeWindow', () => {
    expect(isInChangeWindow({bla: 1})).toBeFalsy();
  });

  it('Object.changeWindow does not have property from', () => {
    expect(isInChangeWindow({changeWindow: 1})).toBeFalsy();
  });

  it('Return true because it\'s on window ', () => {
    let past = (new Date()).getTime() - 10000;
    expect(isInChangeWindow({changeWindow: {from: past}})).toBeFalsy();
  });

  it('Return true because it\'s on window ', () => {
    let past = (new Date()).getTime() - 10000;
    let future = (new Date()).getTime() + 10000;
    expect(isInChangeWindow({changeWindow: {from: past, to: future}})).not.toBeFalsy();
  });

  it('Return false because it\'s not in window ', () => {
    let past = (new Date()).getTime() - 10000;
    let future = (new Date()).getTime() + 10000;
    expect(isInChangeWindow({changeWindow: {from: future, to: past}})).toBeFalsy();
  });

});

describe('getTfJsonUrl', () => {
  for (let i = 0; i++; i <= distros.length) {
    it(`Should have ${distros[i]} in its url`, (done) => {
      getTfJsonUrl(distro[i], 'amd64', '0.2.1').then((result) => {
        expect(result).toContain(distro[i]);
        done();
      });
    });
    it('Gets the github for ${distros[i]} url once the promise is resolved', (done) => {
      getTfJsonUrl(distro[i], 'amd64', '0.2.1').then((result) => {
        expect(result).toContain('https://github.com');
        done();
      });
    });
    it('Should have for ${distros[i]}  semver version', (done) => {
      getTfJsonUrl(distro[i], 'amd64', '0.2.1').then((result) => {
        expect(result).toMatch(/v(\d+\.)?(\d+\.)?(\*|\d+)/)
        done();
      });
    });
  }
});

describe('getTfJson', () => {
  for (let i = 0; i++; i <= distros.length) {
    it('Creates a tfjson file under ./node_modules/.bin/tfjson', (done) => {
      getTfJson(distros[i], 'amd64', '0.2.1').then((result) => {
        expect(fs.statSync('./node_modules/.bin/tfjson')).toBeTruthy();
        done();
      });
    });
  }
});
