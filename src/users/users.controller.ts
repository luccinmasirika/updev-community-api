import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.register(createUserDto);
  }

  @Get()
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Get(':username')
  async getUserByEmail(@Param('username') username: string) {
    return this.usersService.getUserByUsername(username);
  }

  @Get(':id/views')
  async getUserUserViews(@Param('id') id: string) {
    return this.usersService.getUserViews(id);
  }

  // follow user
  @Patch(':userId/follow/:authorId')
  async followUser(
    @Param('userId') userId: string,
    @Param('authorId') authorId: string,
  ) {
    return this.usersService.followUser(userId, authorId);
  }

  // get user followers
  @Get(':id/followers')
  async getUserFollowers(@Param('id') id: string) {
    return this.usersService.getFollowedUsers(id);
  }

  // get user following
  @Get(':id/following')
  async getUserFollowing(@Param('id') id: string) {
    return this.usersService.getFollowingUsers(id);
  }

  // get user weekly views
  @Get(':id/weekly-views')
  async getUserWeeklyViews(@Param('id') id: string) {
    return this.usersService.getDailyViewsForWeek(id);
  }

  // get user monthly views
  @Get(':id/monthly-views')
  async getDailyViewsForMonth(@Param('id') id: string) {
    return this.usersService.getDailyViewsForMonth(id);
  }

  // get user yearly views
  @Get(':id/yearly-views')
  async getMonthlyViewsForYear(@Param('id') id: string) {
    return this.usersService.getMonthlyViewsForYear(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  // update user role (AUTHOR)
  @Patch(':id/role')
  async updateUserRole(@Param('id') id: string) {
    return this.usersService.updateUserRole(id);
  }

  // request author role
  @Patch(':id/request-author')
  async requestAuthorRole(@Param('id') id: string) {
    return this.usersService.requestAuthorRole(id);
  }

  // response to author role request
  @Patch(':id/response-author')
  async responseAuthorRole(
    @Param('id') id: string,
    @Param('status') status: RequestStatus,
  ) {
    return this.usersService.respondToAuthorRequest(id, status);
  }

  @Patch()
  updateUserName() {
    return this.usersService.updateAllUsernames();
  }

  @Patch(':id/disable')
  async disable(@Param('id') id: string) {
    await this.usersService.disableAccount(id);
    return 'Utilisateur désactivé avec succès';
  }

  @Patch(':id/activate')
  async activate(@Param('id') id: string) {
    await this.usersService.activateUser(id);
    return 'Utilisateur activé avec succès';
  }

  @Patch(':id/delete')
  async delete(@Param('id') id: string) {
    await this.usersService.deleteAccount(id);
    return 'Utilisateur supprimé avec succès';
  }
}
