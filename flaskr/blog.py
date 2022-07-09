
import os
from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for
)
from werkzeug.exceptions import abort
from werkzeug.utils import secure_filename

from flaskr.auth import login_required
from flaskr.db import get_db

bp = Blueprint('blog', __name__)

@bp.route('/')
def index():
    db = get_db()
    posts = db.execute(
        'SELECT p.id, title, body, img_path, active, created, author_id, username, first_name, last_name'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE active = 1'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('blog/index.html', posts=posts)


@bp.route('/create', methods=('GET', 'POST'))
@login_required
def create():
    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        img_path = request.form['imgName']
        print(img_path)
        error = None

        if not title:
            error = 'Title is required.'

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'INSERT INTO post (title, body, author_id, img_path, active)'
                ' VALUES (?, ?, ?, ?, ?)',
                (title, body, g.user['id'], img_path, True)
            )
            db.commit()
            return redirect(url_for('blog.index'))

    return render_template('blog/create.html')


def get_post(id, check_author=True):
    post = get_db().execute(
        'SELECT p.id, title, body, img_path, active, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' WHERE p.id = ?',
        (id,)
    ).fetchone()

    if post is None:
        abort(404, f"Post id {id} doesn't exist.")

    if check_author and post['author_id'] != g.user['id']:
        abort(403)

    return post


@bp.route('/<int:id>/update', methods=('GET', 'POST'))
@login_required
def update(id):
    post = get_post(id)
    if request.method == 'POST':
        title = request.form['title']
        body = request.form['body']
        new_img_path = request.form['imgName']
        active = request.form.get('active-post')
        
        if active == None:
            active = False
            print("active is nothing")
        else:
            active = True
            print("active is true")

        error = None

        if not title:
            error = 'Title is required.'

        if not new_img_path:
            img_path = post['img_path']
        else:
            img_path = new_img_path

        if error is not None:
            flash(error)
        else:
            db = get_db()
            db.execute(
                'UPDATE post SET title = ?, body = ?, img_path = ?, active = ?'
                ' WHERE id = ?',
                (title, body, img_path, active, id)
            )
            db.commit()
            return redirect(url_for('blog.overview'))

    return render_template('blog/update.html', post=post)


@bp.route('/<int:id>/delete', methods=('POST',))
@login_required
def delete(id):
    post = get_post(id)
    os.remove(os.path.join(os.getcwd(), 
        'flaskr/static/img/uploads', post['img_path']))
    db = get_db()
    db.execute('DELETE FROM post WHERE id = ?', (id,))
    db.commit()
    return redirect(url_for('blog.index'))

@bp.route('/overview')
def overview():
    db = get_db()
    posts = db.execute(
        'SELECT p.id, title, body, img_path, active, created, author_id, username'
        ' FROM post p JOIN user u ON p.author_id = u.id'
        ' ORDER BY created DESC'
    ).fetchall()
    return render_template('blog/overview.html', posts=posts)



