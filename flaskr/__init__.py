import os
import urllib.request
from flask import Flask, flash, request, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
UPLOAD_FOLDER = os.getcwd() + '/flaskr/static/img/uploads'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'}


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        SECRET_KEY='dev',
        DATABASE=os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    print(UPLOAD_FOLDER)
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    from . import db
    db.init_app(app)

    from . import auth
    app.register_blueprint(auth.bp)

    from . import blog
    app.register_blueprint(blog.bp)
    app.add_url_rule('/', endpoint='index')

    def allowed_file(filename):
        return '.' in filename and \
            filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


    @app.route('/upload-file', methods=['POST'])
    def upload_file():

        if request.method == 'POST':
            # check if the post request has the file part
            if 'croppedImage' not in request.files:
                print('nocrop')
                flash('No file part')
                return redirect(request.url)

            print('no error')
            file = request.files['croppedImage']
            print('file requested')
            # If the user does not select a file, the browser submits an
            # empty file without a filename.
            if file.filename == '':
                print('No selected file')
                return redirect(request.url)
            if file and allowed_file(file.filename):
                print('saving file')
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))

                resp = jsonify({'message': 'Files successfully uploaded'})
                resp.status_code = 201
                return resp

        return 'Something'
        


    return app
