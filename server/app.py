
import base64
import random
from flask import Flask
import os
from flask_sock import Sock
import json

import cv2
import numpy as np


UPLOAD_FOLDER = os.getcwd() + '/static'
VIDEO_FOLDER = os.getcwd()+"/static/video"
ALLOWED_EXTENSIONS = {'mp4', 'avi'}
# create flask app
app = Flask(__name__, static_folder='static')
sock = Sock(app)


app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['VIDEO_FOLDER'] = VIDEO_FOLDER


@sock.route('/echo')
def echo(ws):
    vwiter = None
    while True:
        data = ws.receive()
        data = json.loads(data)
        if data['data'] is None:
            if vwiter is not None:
                print("close")
                vwiter.release()
                vwiter = None
        else:
            try:
                original_img_response = base64.b64decode(data['data'])
                img1 = cv2.imdecode(np.fromstring(
                    original_img_response, np.uint8), cv2.IMREAD_COLOR)
                if vwiter is None:
                    vwiter = cv2.VideoWriter(os.path.join(app.config['VIDEO_FOLDER'], str(data['id']) + '.mp4'),
                                             cv2.VideoWriter_fourcc(*'mp4v'), 30, (img1.shape[1], img1.shape[0]))
                vwiter.write(img1)
            except:
                pass
        ws.send(json.dumps(data))


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False, threaded=True)
