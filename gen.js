const contentful = require('contentful');
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('nju33.docset/Contents/Resources/docSet.dsidx');

const client = contentful.createClient({
  space: 'jfvyr7b4oy3y',
  accessToken: 'mDi7kOqfgMi6F2WWgC8KZnqFMukw3d4BrDW3V5FKhBI'
});

(async () => {
  const entries = await client.getEntries({content_type: 'note'});

  db.serialize(() => {
    db.run(
      'CREATE TABLE searchIndex(id INTEGER PRIMARY KEY, name TEXT, type TEXT, path TEXT)'
    );
    db.run('CREATE UNIQUE INDEX anchor ON searchIndex (name, type, path)');

    entries.items.forEach(item => {
      console.log(
        JSON.stringify({
          $name: item.fields.slug,
          $type: 'Entry',
          $path: `https://njuu33.com/dash/docset/${item.fields.slug}`
        })
      );
      db.run(
        'INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ($name, $type, $path)',
        {
          $name: item.fields.slug,
          $type: 'Entry',
          $path: `https://njuu33.com/dash/docset/${item.fields.slug}`
        }
      );

      item.fields.posts.forEach(post => {
        console.log(
          JSON.stringify({
            $name: `${item.fields.slug} ${post.fields.title}`,
            $type: 'Entry',
            $path: `https://nju33.com/dash/docset/${item.fields.slug}/${post.fields.title}`
          })
        );
        db.run(
          'INSERT OR IGNORE INTO searchIndex(name, type, path) VALUES ($name, $type, $path)',
          {
            $name: `${item.fields.slug} ${post.fields.title}`,
            $type: 'Entry',
            $path: `https://nju33.com/dash/docset/${item.fields.slug}/${post.fields.title}`
          }
        );
      });
    });
  });
})();
