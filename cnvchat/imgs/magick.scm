(use srfi-1)
(use srfi-14)
(use gauche.process)

(define (generate-png char-set)
  (char-set-for-each 
   (lambda (c)
     (let ((label (format #f "label:\'~a\'" c))
           (file  (format #f "char_~a.png" (char->integer c))))
       (run-process
        `(convert -background none -fill black -size 16x16 -gravity center ,label ,file)
        :wait #t)))
   char-set))

;;(generate-png #[a-zA-Z])
;;(generate-png #[0-9])
;;(generate-png #[あ-ん])
