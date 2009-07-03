(use sxml.sxpath)
(use rfc.xmpp)

(define-constant hostname     "localhost")
(define-constant yourname     "gauche")
(define-constant yourpass     "gauche")
(define-constant yourresource "Home")


(define (make-vect x y)
  (cons x y))

(define (xcor-vect v)
  (car v))

(define (ycor-vect v)
  (cdr v))

(define (make-frame origin edge1 edge2)
  (cons origin (cons edge1 edge2)))

(define (origin-frame frame)
  (car frame))

(define (edge1-frame frame)
  (car (cdr frame)))

(define (edge2-frame frame)
  (cdr (cdr frame)))

(define (scale-vect n v)
  (make-vect (* n (xcor-vect v))
             (* n (ycor-vect v))))

(define (add-vect v1 v2)
  (make-vect (+ (xcor-vect v1) (xcor-vect v2))
             (+ (ycor-vect v1) (ycor-vect v2))))

(define (sub-vect v1 v2)
  (add-vect v1 (scale-vect -1 v2)))

(define (frame-coord-map frame)
  (lambda (v)
    (add-vect
     (origin-frame frame)
     (add-vect (scale-vect (xcor-vect v)
                           (edge1-frame frame))
               (scale-vect (ycor-vect v)
                           (edge2-frame frame))))))

(define (transform-painter painter origin corner1 corner2)
  (lambda (frame)
    (let ((m (frame-coord-map frame)))
      (let ((new-origin (m origin)))
        (painter
         (make-frame new-origin
                     (sub-vect (m corner1) new-origin)
                     (sub-vect (m corner2) new-origin)))))))

(define (flip-vert painter)
  (transform-painter painter
                     (make-vect 0.0 1.0)   ; new origin
                     (make-vect 1.0 1.0)   ; new end of edge1
                     (make-vect 0.0 0.0))) ; new end of edge2

(define (flip-horiz painter)
  (transform-painter painter
                     (make-vect 1.0 0.0)    ; new origin
                     (make-vect 0.0 0.0)    ; new end of edge1
                     (make-vect 1.0 1.0)))  ; new end of edge2

(define (shrink-to-upper-right painter)
  (transform-painter painter
                     (make-vect 0.5 0.5)
                     (make-vect 1.0 0.5)
                     (make-vect 0.5 1.0)))

(define (rotate90 painter)
  (transform-painter painter
                     (make-vect 1.0 0.0)
                     (make-vect 1.0 1.0)
                     (make-vect 0.0 0.0)))

(define (rotate180 painter)
  (flip-vert (flip-horiz painter)))


(define (squash-inwards painter)
  (transform-painter painter
                     (make-vect 0.0 0.0)
                     (make-vect 0.65 0.35)
                     (make-vect 0.35 0.65)))

(define (below painter1 painter2)
  (let ((split-point (make-vect 0.0 0.5)))
    (let ((paint-top
           (transform-painter painter1
                              split-point
                              (make-vect 1.0 0.5)
                              (make-vect 0.0 1.0)))
          (paint-bottom
           (transform-painter painter2
                              (make-vect 0.0 0.0)
                              (make-vect 1.0 0.0)
                              split-point)))
      (lambda (frame)
        (paint-top frame)
        (paint-bottom frame)))))

(define (beside painter1 painter2)
  (let ((split-point (make-vect 0.5 0.0)))
    (let ((paint-left
           (transform-painter painter1
                              (make-vect 0.0 0.0)
                              split-point
                              (make-vect 0.0 1.0)))
          (paint-right
           (transform-painter painter2
                              split-point
                              (make-vect 1.0 0.0)
                              (make-vect 0.5 1.0))))
      (lambda (frame)
        (paint-left frame)
        (paint-right frame)))))

(define (up-split painter n)
  (if (= n 0)
      painter
      (let ((smaller (up-split painter (- n 1))))
        (below painter (beside smaller smaller)))))

(define (right-split painter n)
  (if (= n 0)
      painter
      (let ((smaller (right-split painter (- n 1))))
        (beside painter (below smaller smaller)))))

(define (corner-split painter n)
  (if (= n 0)
      painter
      (let ((up (up-split painter (- n 1)))
            (right (right-split painter (- n 1))))
        (let ((top-left (beside up up))
              (bottom-right (below right right))
              (corner (corner-split painter (- n 1))))
          (beside (below painter top-left)
                  (below bottom-right corner))))))

(define (square-limit painter n)
  (let ((quarter (corner-split painter n)))
    (let ((half (beside (flip-horiz quarter) quarter)))
      (below (flip-vert half) half))))

(define (paint-gauche frame)
  (print "ctx.save();")
  (format #t "ctx.transform(~a,~a,~a,~a,~a,~a);\n"
          (xcor-vect (edge1-frame frame))
          (ycor-vect (edge1-frame frame))
          (xcor-vect (edge2-frame frame))
          (ycor-vect (edge2-frame frame))
          (xcor-vect (origin-frame frame))
          (ycor-vect (origin-frame frame)))
  (print "draw();")
  (print "ctx.restore();"))

(define-constant cnv-frame (make-frame (make-vect 0 0)
                                       (make-vect 1 0)
                                       (make-vect 0 1)))

(define (parse-message sxml)
  (and-let* ((from ((if-car-sxpath '(jabber:client:message @ from *text*)) sxml))
             (body ((if-car-sxpath '(jabber:client:message jabber:client:body *text*)) sxml)))
    (cons from body)))

(define (my-reader c)
  (let loop ()
    (let1 m (parse-message (xmpp-receive-stanza c))
      (if m
        (values (car m) (read-from-string (cdr m)))
        (loop)))))

(define (my-printer-factory c from)
  (lambda args
    (for-each (lambda (expr)
                (xmpp-message (c :to from)
                              expr))
              args)))

(define (main args)
  (call-with-xmpp-connection hostname
    (lambda (c)
      (xmpp-auth c yourname yourpass)
      (xmpp-bind c yourresource)
      (xmpp-session c)
      (xmpp-presence c)
      (while #t
        (receive (from expr) (my-reader c)
          (let1 my-printer (my-printer-factory c from)
            (my-printer (guard (e
                                (else (condition-ref e 'message)))
                               (with-output-to-string (lambda ()
                                                        (eval expr (interaction-environment))))))))))))
