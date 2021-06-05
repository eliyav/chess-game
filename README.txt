Welcome to my chess game!
The game board is an 8x8 matrix, The grid is 0 indexed.

Game auto starts with White as first player!

Player can enter a move in the console with the following command:
game.movePiece(a, b)
a parameter - refers to the moving piece/square. You enter the x/y coordinates as an array [x,y]
b parameter - refers to the target piece/square. You enter the x/y coordinates as an array [x,y]

**A valid invocation of the movePiece function will look like the below: 
The below moves the pawn from square C2, to C4
game.movePiece([2,1], [4,1])

---------------------------------------------------------------------------------------------------------------
If you believe you can conduct a castling move you enter it in the console with the following command:
game.castling(a, b)
a parameter - refers to the king piece. You enter the x/y coordinates as an array [x,y]
b parameter - refers to the rook piece. You enter the x/y coordinates as an array [x,y]

**A valid invocation of the castlingfunction will look like the below: 
The below would preform a castling move between the King and Rook if they meet all the requirements
The King must be entered as the first point!
game.castling([4,0], [7,0])

Have fun!
