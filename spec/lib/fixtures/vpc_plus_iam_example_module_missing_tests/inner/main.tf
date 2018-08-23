
resource "aws_vpc" "myvpc" {
  cidr_block = "10.0.0.0/8"
}

module "lb_user_innit" {
  source = "../iam_user"
}
