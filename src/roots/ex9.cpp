#include <iostream>
#include <fstream>
#include <vector>
#include <map>

//aardvark: https://www.asciiart.eu/animals/aardvarks
//camel: https://www.asciiart.eu/animals/camels
//duck: https://www.spreadshirt.ie/shop/design/triple+duck+ascii+art+sticker-D62a62f68cb345c7410edb566?sellable=rA9aqJwdOYfr4lmGkoZz-1459-215
//elephant: https://asciiart.cc/view/12349
//giraffe: https://www.pinterest.com/pin/445504588140451431/
//hippo: https://www.asciiart.eu/animals/other-land
//moose: https://stylecampaign.com/blog/2012/01/ascii-art-in-email/
//owl: https://asciiart.cc/view/12480
//snail: https://www.newgrounds.com/art/view/stonestoryrpg/ascii-snail-animations
//turtle: https://www.asciiart.eu/animals/reptiles/turtles

class Animal
{
public:
   char getEye() const
   {
      return eye;
   }

   void setEye(char c)
   {
      eye = c;
   }
   std::vector<std::string> art;
   friend std::ostream& operator<<(std::ostream& os, const Animal& animal)
   {
      for (const std::string& line : animal.art)
      {
         for (char c : line)
         {
            if (c == 'o' || c == 'O')
            {
               os << animal.eye;
            }
            else
            {
               os << c;
            }
         }
         os << "\n";
      }
      return os;
   }

protected:
   char eye = 'o';
};



class Aardvark final : public Animal
{
public:
   Aardvark()
   {
      art = {
            "  //\\    _.---._       ",
            "  \\\\/`--\"       '\\.    ",
            "  / o              \\.  ",
            " / __/   ______(  /\\.\\ ",
            "/ /  / / |   / /\\ \\  \\.",
            "\\/  /_/|_|  /_/  \\_\\   "
      };
   }
};

class Camel final : public Animal
{
public:
   Camel()
   {
      art = {
         " __,,              ",
         "(_.o \\   ..  ..    ",
         "  |'-/  /--\\'--\\   ",
         "   \\ \\_/        \\  ",
         "    '.__  /__/  /'.",
         "       | /(  | /(  ",
         "       // \\\\ // \\\\ ",
         "     _//  _|//  _||",
         "    '--' ''--' '--'"
      };
   }
};

class Duck final : public Animal
{
public:
   Duck()
   {
      art = {
         "  _   ",
         ">(o)__",
         " (___/"
      };
   }
};

class Elephant final : public Animal
{
public:
   Elephant()
   {
      art = {
         "  __     __          ",
         " /  \\~~~/  \\         ",
         "(    oo     )----,   ",
         " \\__     __/      \\  ",
         "   )|  /)         |\\ ",
         "    | /\\  /___\\   / ^",
         "    |/-|__|   |__|   "
      };
   }
};

class Giraffe final : public Animal
{
public:
   Giraffe(int neckLength)
   {
      art.push_back(" /)ii/)   ");
      art.push_back("(_ oo)    ");
      for (int i = 0; i < neckLength; ++i)
      {
         std::string neckPart = "   |";
         int patchChance = std::rand() % 100;
         if (patchChance % 3 == 0)
         {
            neckPart += '*';
         }
         else
         {
            neckPart += ' ';
         }
         neckPart += '|';

         if (i != neckLength - 1)
         {
            neckPart += "    ";
         }

         art.push_back(neckPart);
      }

      art.back() += "___|";
      art.push_back("   | *   |");
      art.push_back("   | ___*|");
      art.push_back("   ||   ||");
      art.push_back("   ||   ||");
   }
};

class Hippo final : public Animal
{
public:
   Hippo()
   {
      eye = 'O';
      art = {
            "      ^~~^ ,---------.   ",
            " ,---'OO  )           \\  ",
            "( 0 0                  )/",
            " `=^='                 / ",
            "       \\    ,     .   /  ",
            "       \\\\  |-----'|  /   ",
            "       ||__|    |_|__|   "
      };
   }
};

class Moose : public Animal
{
public:
   Moose()
   {
      eye = 'O';
      art = {
         "\\_\\_    _/_/          ",
         "    \\__/              ",
         "    (OO)\\_________    ",
         "    (__)\\         )\\/\\",
         "        ||-------||   ",
         "        ||       ||   "
      };
   }
};

class Owl final : public Animal
{
public:
   Owl()
   {
      eye = 'O';
      art = {
         ",___,",
         "{O,O}",
         "(__(\\",
         " \" \" "
      };
   }
};

class Snail final : public Animal
{
public:
   Snail()
   {
      art = { "o  o   .---.     ",
         " \\ )  /  __ \\    ",
         " (  )/  / _) )   ",
         "  \\  `--\\___/-._ ",
         "   '------------'"
      };
   }
};

class Turtle final : public Animal
{
public:
   Turtle()
   {
      art = {
         " ____     _____  ",
         "| o  |  / \\__/ \\ ",
         "|/___ \\|\\_/__\\_/|",
         "      \\_________|",
         "      |_|_| |_|_|"
      };
   }
};

class AnimalChanger
{
public:
   virtual void changeAnimal(Animal& animal) const = 0;
   virtual ~AnimalChanger() = default;
};

class EyesCloser final : public AnimalChanger
{
public:
   EyesCloser(char closedEyeChar = '-') : closedEye(closedEyeChar)
   {
   }
   void changeAnimal(Animal& animal) const override
   {
      animal.setEye(closedEye);
   }
protected:
   char closedEye;
};

class MirrorReflecter final : public AnimalChanger
{
public:
   void changeAnimal(Animal& animal) const override
   {
      std::vector<std::string> mirroredArt;
      for (const std::string& line : animal.art)
      {
         std::string mirroredLine;
         for (auto it = line.rbegin(); it != line.rend(); ++it)
         {
            char c = *it;
            switch (c)
            {
            case '\\':
               c='/';
               break;
            case '/':
               c='\\';
               break;
            case '(':
               c=')';
               break;
            case ')':
               c='(';
               break;
            case '<':
               c='>';
               break;
            case '>':
               c='<';
               break;
            case '[':
               c=']';
               break;
            case ']':
               c='[';
               break;
            case '{':
               c='}';
               break;
            case '}':
               c='{';
               break;
            default:
               break;
            }
            mirroredLine += c;
         }
         mirroredArt.push_back(mirroredLine);
      }
      animal.art = mirroredArt;
   }
};

class Zoo
{
public:
   Zoo()
   {
      animals = {
      new Aardvark(),
      new Giraffe(5),
      new Camel(),
      new Duck(),
      new Elephant(),
      new Hippo(),
      new Moose(),
      new Owl(),
      new Snail(),
      new Turtle()
      };
   }

   ~Zoo()
   {
      for (Animal* animal : animals)
      {
         delete animal;
      }
      for (AnimalChanger* changer : changers)
      {
         delete changer;
      }
   }

   void addAnimalChanger(AnimalChanger* changer)
   {
      changers.push_back(changer);
   }

   void changeAnimal(int idx)
   {
      if (idx >= animals.size())
      {
         return;
      }

      for (const AnimalChanger* changer : changers)
      {
         changer->changeAnimal(*animals[idx]);
      }
   }

   void printAnimals() const
   {
      for (const Animal* animal : animals)
      {
         std::cout << *animal << std::endl;
      }
   }

private:
   std::vector<Animal*> animals;
   std::vector<AnimalChanger*> changers;
};

int main()
{
   srand(time(NULL));
   Zoo zoo;
   zoo.addAnimalChanger(new EyesCloser());
   zoo.changeAnimal(1);
   zoo.addAnimalChanger(new MirrorReflecter());
   zoo.changeAnimal(3);
   zoo.changeAnimal(5);
   zoo.changeAnimal(6);
   zoo.printAnimals();
   return 0;
}
