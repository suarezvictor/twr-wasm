#include <stddef.h>
#include <assert.h>
#include <stdio.h>
#include <math.h>
#include "canvas.h"

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

// new & delete operators are defined in std libc++, which is not implemented (yet?)
void* operator new (twr_size_t sz)
{
  void *p;

  if (__builtin_expect (sz == 0, false))
    sz = 1;

  if ((p = twr_malloc (sz)) == 0)
    __builtin_trap();

  return p;
}

void operator delete(void* ptr) noexcept
{
  twr_free(ptr);
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////

#define PI 3.14159265359
#define MAX_BALLS 200
#define GFHDR_HEIGHT 30

#define DEFAULT_BALL_COLOR 0xFF0000
//CSSCLR_BLUE20

class Ball {  
  public:
    colorRGB m_ballcolor;
    double m_x, m_y;
    double m_deltaX, m_deltaY;
    int m_radius; 
    Ball(double x, double y, int r, double deltaX, double deltaY, colorRGB color);           
    void draw(twrCanvas& canvas);
    void move();
};

Ball::Ball(double x, double y, int r, double deltaX, double deltaY, colorRGB color)  {
  m_x=x;
  m_y=y;
  m_deltaX=deltaX;
  m_deltaY=deltaY;
  m_radius=r;
  m_ballcolor=color;  
}

void Ball::draw(twrCanvas& canvas) {
  canvas.setFillStyle(m_ballcolor);
  canvas.beginPath();
  canvas.arc(m_x, m_y, m_radius, 0.0, PI*2, true);
  canvas.fill();
}

void Ball::move() {
  //twr_dbg_printf("Ball::move() this %x  &m_x %x, &m_deltaX %x, &m_y %x, &m_deltaY %x\n",this, &m_x, &m_deltaX, &m_y, &m_deltaY);
  m_x+=m_deltaX;
  m_y+=m_deltaY;
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


class GameField  {
  private:
    twrCanvas &m_canvas;    

  public:
    GameField();
    void draw();
    void moveBalls();
    bool hitRightEdge(Ball*);
    bool hitLeftEdge(Ball*);
    bool hitBottomEdge(Ball*);
    bool hitTopEdge(Ball*);
    void splitBall(int n);
    void checkerBoard();


    colorRGB m_backcolor;
    colorRGB m_forecolor;
    int m_width;
    int m_height;
    int m_numBalls;
    Ball* m_balls[MAX_BALLS];
};


GameField::GameField() : m_canvas(*(new twrCanvas())) {
  m_backcolor=CSSCLR_BLACK; // black
  m_forecolor=CSSCLR_GRAY10;  // light gray
  m_width=1000;  //!!!!  ADD FEATURE TO QUERY CANVAS
  m_height=600;
  m_numBalls=1;
  m_balls[0]=new Ball(m_width/2, m_height/2, 75, -3, 0, DEFAULT_BALL_COLOR);
}

void GameField::draw() {
  char buf[40];

  m_canvas.startDrawSequence();

  m_canvas.setFillStyle(m_backcolor);
  m_canvas.fillRect(0, 0, m_width, m_height);

  checkerBoard();  // this will overwrite most of above fillRect.  putImageData() does 'respect' the existing canvas alpha

  m_canvas.setFillStyle(m_backcolor);
  m_canvas.setStrokeStyle(m_forecolor);
  m_canvas.setLineWidth(2);
  m_canvas.strokeRect(1, 1, m_width-2, m_height-2);

  m_canvas.setFillStyle(m_backcolor);
  m_canvas.setStrokeStyle(m_forecolor);

  m_canvas.beginPath();
  m_canvas.moveTo(0, GFHDR_HEIGHT);
  m_canvas.lineTo(m_width, GFHDR_HEIGHT);
  m_canvas.stroke();

  m_canvas.setFillStyle(m_forecolor);
  snprintf(buf, sizeof(buf), "BALLS: %d", m_numBalls);
  m_canvas.fillText(15, 7, buf);

  for (int i=0; i< m_numBalls; i++)
    m_balls[i]->draw(m_canvas);

  m_canvas.endDrawSequence();

}

void GameField::moveBalls() {

  const int n=m_numBalls;
  for (int i=0; i < n && m_numBalls<MAX_BALLS; i++) {
    m_balls[i]->move();
    
    if ( hitRightEdge(m_balls[i]) ) {
      m_balls[i]->m_deltaX = -m_balls[i]->m_deltaX;
      m_balls[i]->m_x = m_width - m_balls[i]->m_radius - 1;
      splitBall(i);
    }
    else if ( hitLeftEdge(m_balls[i]) ) {
      m_balls[i]->m_deltaX = -m_balls[i]->m_deltaX;
      m_balls[i]->m_x = m_balls[i]->m_radius + 1;
      splitBall(i);
    }
    else if ( hitBottomEdge(m_balls[i]) ) {
      m_balls[i]->m_deltaY = -m_balls[i]->m_deltaY;
      m_balls[i]->m_y = m_height - m_balls[i]->m_radius - 1;
      splitBall(i);
    }
    else if ( hitTopEdge(m_balls[i]) ) {
      m_balls[i]->m_deltaY = -m_balls[i]->m_deltaY;
      m_balls[i]->m_y = m_balls[i]->m_radius + 1 + GFHDR_HEIGHT;
      splitBall(i);
    }

  }

}

bool GameField::hitRightEdge(Ball *b) {
  return b->m_x + b->m_radius >= m_width;
}

bool GameField::hitLeftEdge(Ball *b) {
  return b->m_x - b->m_radius <= 0;
}

bool GameField::hitBottomEdge(Ball *b) {
  return b->m_y + b->m_radius >= m_height;
}

bool GameField::hitTopEdge(Ball *b) {
  return b->m_y - b->m_radius <= GFHDR_HEIGHT;
}

void GameField::splitBall(int n) {
  Ball &b=*m_balls[n];
  if (b.m_radius<=2) {
    twr_dbg_printf("split aborted\n");
    return;  // stop splitting
  }

  const double theta_prime = 33.3333*PI/180.0;      // given: 33.33 deg angle for new balls from current ball vector

  // to rotate coordinate system
  //xˆ = x cos θ + y sin θ and ˆy = −x sin θ + y cos θ
  const double dx=b.m_deltaX;
  const double dy=b.m_deltaY;
  const double x_prime = dx*(double)cos(theta_prime)+dy*(double)sin(theta_prime);
  const double y_prime = -dx*(double)sin(theta_prime)+dy*(double)cos(theta_prime);

  // p=PI*A*V ~ rad*rad*v, if area (aka mass) halfs, |V| doubles, and rad is .707*rad
  // but there are two new balls with half the mass each, so |velocity| of each remains the same

  b.m_deltaX=x_prime;  
  b.m_deltaY=y_prime;
  b.m_radius= ((double)b.m_radius*(double).707);
  b.m_ballcolor=DEFAULT_BALL_COLOR; 

  const double x_prime2 = dx*(double)cos(-theta_prime)+dy*(double)sin(-theta_prime);
  const double y_prime2 = -dx*(double)sin(-theta_prime)+dy*(double)cos(-theta_prime);

  //double xx=(double)sin(theta_prime);
  //double yy=(double)sin(-theta_prime);too many balls cos() %g cos(-) %g\n", theta_prime, -theta_prime, xx, yy);


  m_balls[m_numBalls++]=new Ball(b.m_x, b.m_y, b.m_radius, x_prime2, y_prime2, DEFAULT_BALL_COLOR);
  assert (m_numBalls<=MAX_BALLS);
}

// uses ImageData/putImageData to draw checkerboard, as test/example
void GameField::checkerBoard() {
  const int W=100;
  const int H=100;
  unsigned char bitmapDark[W*H*4];  // pos 0->Red, 1->Green, 2->Blue, 3->Alpha
  unsigned char bitmapWhite[W*H*4];  // pos 0->Red, 1->Green, 2->Blue, 3->Alpha

  for (int i=0; i < W*H*4; i=i+4) {
    //
    bitmapDark[i]=CSSCLR_GRAY5>>16;
    bitmapDark[i+1]=(CSSCLR_GRAY5>>8)&0xFF;
    bitmapDark[i+2]=CSSCLR_GRAY5&0xFF;
    bitmapDark[i+3]=0xFF;

    bitmapWhite[i]=0xFF;
    bitmapWhite[i+1]=0xFF;
    bitmapWhite[i+2]=0xFF;
    bitmapWhite[i+3]=0xFF;
  }

  m_canvas.imageData(&bitmapDark, sizeof(bitmapDark), W, H);
  m_canvas.imageData(&bitmapWhite, sizeof(bitmapWhite), W, H);

  for (int y=0; y<m_height-GFHDR_HEIGHT; y=y+H) {
    for (int x=0; x<m_width; x=x+W*2) {
      if ((y%(H*2))==0) {
        m_canvas.putImageData(&bitmapDark, x, y+GFHDR_HEIGHT);
        m_canvas.putImageData(&bitmapWhite, x+W, y+GFHDR_HEIGHT);
      }
      else {
        m_canvas.putImageData(&bitmapWhite, x, y+GFHDR_HEIGHT);
        m_canvas.putImageData(&bitmapDark, x+W, y+GFHDR_HEIGHT);
      }
    }
  }
}

//////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////


GameField *theField;   // global objects init not implemented (yet)

extern "C" int bounce_balls_init() {

#if 0
  twr_wasm_print_mem_debug_stats();

  if (twr_malloc_unit_test()==0) {
    twr_dbg_printf("twr_malloc_unit_test FAIL\n");
    __builtin_trap();
  }

  twr_dbg_printf("twr_malloc_unit_test PASS\n");

  twr_wasm_print_mem_debug_stats();
#endif

  theField = new GameField();
  theField->draw();

  return 0;
}

extern "C" int bounce_balls_move() {
  //time_t start, move, draw, end;

  if (theField->m_numBalls<MAX_BALLS) {
    //time(&start);
    theField->moveBalls();
    //time(&move);

    theField->draw();
    //time(&draw);

    //theField->m_canvas.endDrawSequence();
    //time(&end);

    //twr_dbg_printf("move %dms, draw %dms render %dms\n", move-start, draw-move, end-draw);

  }

  return 0;
}